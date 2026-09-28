import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { fetchFeed, selectLibrary } from "../../Redux/Features/Library/librarySlice";
import { usePageMeta } from "../../function/pageMeta";

const Home = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectLibrary).feed;
  usePageMeta("Home feed", "Fresh premieres from across the PlayTube network.");

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  return (
    <div className="w-full overflow-y-auto bg-void">
      <h1 className="sr-only">PlayTube screening room — fresh premieres</h1>
      <div className="px-4 pb-10 pt-5 sm:px-6">
        {status === "loading" ? (
          <CardsSkeleton />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={() => dispatch(fetchFeed({ force: true }))} />
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((video) => (
              <VideoCard key={video.id} data={video} />
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="A blank marquee"
            hint="Nobody on the network has premiered anything yet. Yours could be first."
            actionTo="/upload"
            actionLabel="Premiere a video"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
