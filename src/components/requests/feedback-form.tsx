"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { StarRating } from "@/components/ui/star-rating";
import { submitFeedback } from "@/lib/actions/feedback-actions";

export function FeedbackForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [problemSolved, setProblemSolved] = useState<"YES" | "PARTIALLY" | "NO" | "">("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problemSolved) {
      setError("Please select whether the problem was solved.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback({ request_id: requestId, problem_solved: problemSolved, rating, comment });
      if (result.success) {
        toast.success("Thank you for your feedback.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Please rate the maintenance service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="problem_solved">Was the problem solved?</Label>
            <Select
              id="problem_solved"
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value as typeof problemSolved)}
            >
              <option value="">Select</option>
              <option value="YES">Yes</option>
              <option value="PARTIALLY">Partially</option>
              <option value="NO">No</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="comment">Comments (optional)</Label>
            <Textarea id="comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          </FieldGroup>
          <FieldError>{error ?? undefined}</FieldError>
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
