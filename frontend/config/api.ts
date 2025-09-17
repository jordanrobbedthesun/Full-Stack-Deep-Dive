// super tiny "backend" placeholder for the demo
export async function sendMessage(userText: string): Promise<{ reply: string }> {
  // For the live demo, just echo a friendly reply.
  // Later, swap this to your real backend (fetch/axios).
  await new Promise((r) => setTimeout(r, 600));
  return { reply: `You said: "${userText}". Here's a helpful reply!` };
}
