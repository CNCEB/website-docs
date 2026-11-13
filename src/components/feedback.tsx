'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

export function Feedback({ url }: { url: string }) {
  const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  async function send(opinion: 'good' | 'bad', message: string) {
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinion, url, message }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-fd-muted-foreground border rounded-lg p-3 mt-8">
        感谢反馈！
      </p>
    );
  }

  return (
    <div className="border rounded-lg p-3 mt-8 flex flex-col gap-2 text-sm">
      <p className="font-medium">此页对你有帮助吗？</p>
      {opinion === null ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpinion('good')}
            className="inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 hover:bg-fd-accent"
          >
            <ThumbsUp className="size-4" />
            有帮助
          </button>
          <button
            type="button"
            onClick={() => setOpinion('bad')}
            className="inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 hover:bg-fd-accent"
          >
            <ThumbsDown className="size-4" />
            需改进
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(opinion, message);
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              opinion === 'good'
                ? '欢迎补充具体建议（可选）'
                : '请描述遇到的问题（可选）'
            }
            rows={3}
            className="border rounded-md p-2 bg-fd-secondary/50 resize-y"
          />
          <div className="flex gap-2 items-center">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 hover:bg-fd-accent disabled:opacity-50"
            >
              {status === 'sending' && (
                <Loader2 className="size-4 animate-spin" />
              )}
              提交反馈
            </button>
            {status === 'error' && (
              <p className="text-fd-destructive">提交失败，请稍后再试</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
