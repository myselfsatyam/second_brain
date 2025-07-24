import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import userContent from "../models/contentModel";

export const newContent = async(req: AuthRequest,res: Response)=>{
  try{
    const {link,contentType,title,tag} = req.body;
    const userid = req.userID;

    //checking whether user given all the field or not
    if (!link || !contentType || !title || !userid) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // TODO: Fetch content from the link (article, document, or YouTube transcript)
    let contentToSummarize = link;
    try {
      const { extractArticleText, extractYoutubeTranscript } = require("../utils/summarizeContent");
      if (contentType === "Article") {
        const extracted = await extractArticleText(link);
        if (extracted && extracted.length > 100) {
          contentToSummarize = extracted;
        }
      }
      if (contentType === "Youtube") {
         const transcript = await extractYoutubeTranscript(link);
         if (transcript && transcript.length > 100) {
           contentToSummarize = transcript;
         } else {
           const ytMeta = await require("../utils/summarizeContent").extractYoutubeTitleAndDescription(link);
           if (ytMeta && ytMeta.length > 20) {
             contentToSummarize = ytMeta;
           }
         }
      }
      // TODO: Add Twitter extraction here
    } catch (e) {
      console.error("Error extracting article text:", e);
    }

    // TODO: Call AI summarization utility
    let summary = "";
    try {
      const { summarizeContent } = require("../utils/summarizeContent");
      console.log("[DEBUG] contentType:", contentType);
      console.log("[DEBUG] link:", link);
      console.log("[DEBUG] contentToSummarize:", contentToSummarize?.slice(0, 500));
      summary = await summarizeContent(contentToSummarize);
      console.log("Generated summary =>", summary);
    } catch (e) {
      summary = ""; // fallback if summarization fails
    }

    const contentCreated = new userContent({
      link:link,
      contentType:contentType,
      title:title,
      tag:tag,
      userId:userid,
      summary: summary
    })

    await contentCreated.save();
    res.status(200).json({
      message: "Content saved Successfully"
    })
    return;
  }catch(err){
    console.log("Err(catch): something went wrong",err)
    return;
  }
}

export const content = async(req: AuthRequest, res: Response)=>{
  try{
    const userid = req.userID;

    //checking userid present or not
    if(!userid){
      res.status(400).json({ message: "Something wrong" });
      return;
    }

    const userData = await userContent.find({ userId: userid });
    res.status(200).json({
      message: "User data fetched successfully",
      data: userData,
    });
    console.log(userData)
  }catch(err){
    console.log("Err(catch): something went wrong",err)
    return;
  }
}

export const deleteContent = async(req: AuthRequest, res: Response)=>{
  try{
    const userid = req.userID;
    const userTitle = req.params.contentId;
    
    console.log("userid =>", userid)
    console.log("contentid =>", userTitle)

    if (!userid || !userTitle) {
       res.status(400).json({ message: "User ID or Content ID missing" });
       return;
    }

    const content = await userContent.findOne({ title: userTitle, userId: userid });

    if (!content) {
      res.status(404).json({ message: "Content not found or unauthorized" });
      return;
    }

    await userContent.findByIdAndDelete(content);

     res.status(200).json({ message: "Content deleted successfully" });
     return;
  }catch(err){
    console.log("Err(catch): something went wrong",err)
    return;
  }
}

export const shareContent = async(req: AuthRequest, res: Response)=>{
  const { userId } = req.params;
  try {
    const documents = await userContent.find({ userId });
    res.status(200).json({ data: documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}