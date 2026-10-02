export interface Session {
  id: string;
  title: string | null;
  status: string;
  summary: string | null;
  action_items: string | null;
  decisions: string | null;
  open_questions: string | null;
  transcript: TranscriptSegment[];
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker: string | null;
}
