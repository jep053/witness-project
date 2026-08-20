import type { Post, PostTag } from '@/lib/types'

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    user_id: 'user-1',
    content: 'Finished the Auth flow today. Small win, feels good.',
    image_url: null,
    is_hidden: false,
    created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'post-2',
    user_id: 'user-1',
    content: 'Two chapters in on Atomic Habits.',
    image_url: null,
    is_hidden: false,
    created_at: '2026-08-19T20:00:00Z',
  },
  {
    id: 'post-3',
    user_id: 'user-3',
    content: '10k run this morning, legs are dead.',
    image_url: null,
    is_hidden: false,
    created_at: '2026-08-20T07:30:00Z',
  },
]

export const mockPostTags: PostTag[] = [
  { post_id: 'post-1', tag_id: 'tag-1' },
  { post_id: 'post-2', tag_id: 'tag-3' },
  { post_id: 'post-3', tag_id: 'tag-2' },
]