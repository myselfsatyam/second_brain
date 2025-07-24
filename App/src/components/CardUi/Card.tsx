import DocumentIcon from "../icons/DocumentIcon";
import NotionIcon from "../icons/NotionIcon";
import DeleteIcon from "../icons/DeleteIcon";
import Tags from "./Tags";
import { format } from 'date-fns'
import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TwitterIcon from "../icons/TwitterIcon";
import clsx from "clsx";


interface CardProps {
  icon: "Youtube" | "Twitter" | "Notion";
  tag: "Productivity" | "Tech & Tools" | "Mindset" | "Learning & Skills" | "Workflows" | "Inspiration";
  title: string;
  link: string; 
  summary?: string; // AI-generated summary
  reload?: ()=> void
}

const Card = (props: CardProps) => {
  const navigate = useNavigate();
  const date = format(new Date(), 'dd MMM yyyy');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  let contentPreview: JSX.Element = <p className="text-gray-500">No content available</p>;



  const getYoutubeId = (url: string): string | null => {
    const regularFormat = url.split("v=");
    if (regularFormat.length > 1) {
      const videoId = regularFormat[1].split("&")[0];
      return videoId;
    }

    const shortFormat = url.split("youtu.be/");
    if (shortFormat.length > 1) {
      const videoId = shortFormat[1].split("?")[0];
      return videoId;
    }

    return null; 
  };
  
  if (props.icon === "Youtube") {
    contentPreview = (
      <div className="flex justify-center pt-6 items-center">
        {thumbnail ? (
          <a href={props.link} target="_blank" rel="noopener noreferrer">
            <img src={thumbnail} alt={props.title} className="w-[90%] rounded-lg ml-3" />
          </a>
        ) : (
          <p className="text-gray-500">No thumbnail available</p>
        )}
      </div>
    );
  } else if (props.icon === "Twitter") {
    contentPreview = (
      <div className="flex justify-center pt-6 items-center">
          <a href={props.link} target="_blank" rel="noopener noreferrer">
            <div className="w-[90%] rounded-lg ml-3">
              <TwitterIcon />
            </div>
          </a>
      </div>
    );
  } else if(props.icon === "Notion"){
    contentPreview = (
      <div className="flex justify-center pt-6 items-center">
          <a href={props.link} target="_blank" rel="noopener noreferrer">
            <div className="w-[90%] rounded-lg ml-3">
              <NotionIcon />
            </div>
          </a>
      </div>
    );
  }

  useEffect(() => {
    const videoId = getYoutubeId(props.link);
    if (videoId) {
      setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    } else {
      setThumbnail(null);
    }
  }, [props.link]);
  
  async function deleteHandle(){
    try{
      const token = localStorage.getItem("token");
      if(!token){
        alert("Please log in first");
        navigate("/"); 
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/delete/${props.title}`, {
        method: "Delete",
        headers: {
          "token": token
        },
        credentials: "include"
      });
      if(res.ok){
        alert("Item deleted");
        props.reload && props.reload();
        return;
      }
    }catch(err){
      console.log("item not deleted");
      return;
    }
  }

  return (
    <div className="max-w-sm min-h-[350px] w-full bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col justify-between transition-transform hover:scale-[1.025]">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex gap-2 items-center">
          <span className="pt-1"><DocumentIcon /></span>
          <span className="font-semibold text-lg md:text-xl truncate max-w-[180px]">{props.title}</span>
        </div>
        <button className="p-1 rounded hover:bg-red-50 transition" onClick={deleteHandle} title="Delete">
          <DeleteIcon />
        </button>
      </div>
      {/* Content Preview */}
      <div className="flex-1 flex items-center justify-center py-4">
        {contentPreview}
      </div>
      {/* Summary Section */}
      {props.summary && (
        <div className="bg-slate-50 mx-5 my-2 px-4 py-3 rounded-lg text-gray-700 text-sm relative">
          <span className="font-semibold block mb-1">Summary</span>
          <span className={clsx("block whitespace-pre-line", !showFullSummary && "line-clamp-3")}>{props.summary}</span>
          {props.summary.length > 180 && (
            <button
              className="text-blue-500 text-xs mt-1 absolute right-3 bottom-2 bg-white px-1 rounded hover:underline"
              onClick={() => setShowFullSummary((v) => !v)}
            >
              {showFullSummary ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}
      {/* Tags and Footer */}
      <div className="flex flex-wrap gap-2 px-5 pb-2 items-center justify-between mt-auto">
        <Tags tagTypes={props.tag} />
        <span className="text-xs text-gray-400">Created on: <span className="font-medium">{date}</span></span>
      </div>
    </div>
  );
};

export default Card;