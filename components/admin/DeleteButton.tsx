"use client";

interface Props {
  postId: string;
  action: (formData: FormData) => Promise<void>;
}

export default function DeleteButton({ postId, action }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={postId} />
      <button
        type="submit"
        className="text-xs px-2 py-1 rounded transition-colors"
        style={{ color: "#e05555", border: "1px solid var(--border-subtle)" }}
        onClick={(e) => { if (!confirm("确认删除？")) e.preventDefault(); }}
      >
        删除
      </button>
    </form>
  );
}
