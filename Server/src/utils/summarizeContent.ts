import axios from "axios";
import { JSDOM } from "jsdom";
import { YoutubeTranscript } from "youtube-transcript";
import { extract } from '@extractus/article-extractor';

const HF_API_KEY = process.env.HF_API_KEY; // Add this to your .env file

// Fetch and extract main article text from a URL
export async function extractArticleText(url: string): Promise<string> {
  try {
    // Try robust extraction first
    const article = await extract(url);
    if (article && article.content && article.content.length > 100) {
      // Remove HTML tags if present
      const text = article.content.replace(/<[^>]+>/g, ' ');
      return text.trim();
    }
  } catch (error) {
    console.error("[extractus] Failed to extract article:", error);
  }
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    // Try to get the main content (simple approach)
    let text = "";
    const article = document.querySelector("article");
    if (article) {
      text = article.textContent || "";
    } else {
      // fallback: get all paragraph text
      text = Array.from(document.querySelectorAll("p"))
        .map(p => (p as Element).textContent)
        .join("\n");
    }
    return text.trim();
  } catch (error) {
    console.error("Failed to extract article text:", error);
    return "";
  }
}

export async function summarizeContent(text: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: text },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );
    // The response is usually an array of objects with a summary_text field
    return response.data[0]?.summary_text || "";
  } catch (error: any) {
    console.error("Hugging Face API error:", error.response?.data || error.message);
    console.error("HF_API_KEY used:", HF_API_KEY);
    return "";
  }
}

// Fetch transcript from a YouTube video URL
export async function extractYoutubeTranscript(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
    const videoId = match ? match[1] : null;
    console.log("[YT] Extracted videoId:", videoId);
    if (!videoId) return "";
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log("[YT] Transcript length:", transcript.length);
    if (transcript.length === 0) {
      console.warn("[YT] No transcript found for video:", videoId);
    }
    // Join transcript segments into a single string
    return transcript.map((seg: { text: string }) => seg.text).join(" ");
  } catch (error) {
    console.error("Failed to fetch YouTube transcript:", error);
    return "";
  }
}

// Fallback: Fetch YouTube video title and description
export async function extractYoutubeTitleAndDescription(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const title = document.querySelector('title')?.textContent || '';
    // YouTube description is in a meta tag
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    return `${title}\n${desc}`.trim();
  } catch (error) {
    console.error("Failed to fetch YouTube title/description:", error);
    return '';
  }
} 