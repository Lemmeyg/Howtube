-- First, select the videos you want to make public
-- Replace the IDs with the actual video IDs you want to make public
SELECT copy_to_public_video(ARRAY[
    'video-id-1'::uuid,
    'video-id-2'::uuid,
    'video-id-3'::uuid
]);