import { runClothingUploadPipeline } from "@/lib/upload-pipeline";

/**
 * Streams upload progress back to the client as Server-Sent Events. A plain
 * server action can't push incremental updates mid-call, so this endpoint
 * exists specifically to report real progress while runClothingUploadPipeline
 * works through its stages. Uses a POST body (not the browser EventSource
 * API, which only supports GET) — the client reads the stream manually.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return new Response("No photo provided", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      try {
        const item = await runClothingUploadPipeline(file, (stage) =>
          send({ type: "progress", stage }),
        );
        send({ type: "done", item });
      } catch (error) {
        console.error("Upload pipeline failed", error);
        send({ type: "error", message: "Something went wrong adding this item." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
