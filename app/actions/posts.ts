'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTag } from '@/lib/data/tags'
import {
  MAX_TAGS_PER_POST,
  normalizeTagName,
  validateTagName,
} from '@/lib/validation/tags'
import type { Post } from '@/lib/types'

export type CreatePostResult = { post: Post } | { error: string }

export async function createPost(
  content: string,
  tagNames: string[],
  isHidden: boolean,
  currentPath: string
): Promise<CreatePostResult> {
  const user = await requireAuth(currentPath)

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Post content cannot be empty.' }

  // Validate on the server too — client checks are UX, not security.
  const names = [...new Set(tagNames.map(normalizeTagName))]
  if (names.length > MAX_TAGS_PER_POST) {
    return { error: `You can add at most ${MAX_TAGS_PER_POST} tags.` }
  }
  for (const name of names) {
    const problem = validateTagName(name)
    if (problem) return { error: problem }
  }

  const supabase = await createClient()

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ user_id: user.id, content: trimmed, is_hidden: isHidden })
    .select()
    .single()

  if (postError || !post) {
    console.error('[createPost] insert failed:', postError?.message)
    return { error: 'Could not create post. Please try again.' }
  }

  if (names.length > 0) {
    const tags = await Promise.all(names.map(getOrCreateTag))
    const resolved = tags.filter((t): t is NonNullable<typeof t> => t !== null)

    const { error: linkError } =
      resolved.length === names.length
        ? await supabase
            .from('post_tags')
            .insert(resolved.map((tag) => ({ post_id: post.id, tag_id: tag.id })))
        : { error: { message: 'tag resolution failed' } }

    if (linkError) {
      console.error('[createPost] tag link failed:', linkError.message)
      // Roll back the post so the user can retry with the form intact,
      // instead of ending up with a post missing the tags they chose.
      await supabase.from('posts').delete().eq('id', post.id)
      return { error: 'Could not attach tags. Please try again.' }
    }
  }

  revalidatePath('/my-journey')
  revalidatePath('/others')
  return { post: post as Post }
}