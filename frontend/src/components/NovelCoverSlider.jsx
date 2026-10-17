import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Pin, Sparkles, Heart, Flame } from "lucide-react";
import LazyImage from "./LazyImage";
import { apiClient, getImageUrl } from "../utils/api";

const RatingBadge = ({ rating }) => {
  const val = Number(rating) || 0;
  if (val <= 0) return null;
  return (
    <div className="flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-md border border-amber-500/30">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-[11px] font-semibold text-amber-300">{val.toFixed(1)}</span>
    </div>
  );
};

const NovelCoverSlider = ({
  title = "SERIES",
  subtitle = null,
  iconType = "sparkles", // "pin", "sparkles", "heart", "flame"
  targetUrl = "/novels",
  fetchParams = { page: 1, per_page: 15, orderBy: "Update" },
}) => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const fetchNovels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getContents(fetchParams);
      const items = res?.data || [];
      setNovels(items);
    } catch (err) {
      console.error(`Error loading slider [${title}]:`, err);
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, [fetchParams, title]);

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    dragDistanceRef.current = Math.abs(walk);
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const renderIcon = () => {
    switch (iconType) {
      case "pin":
        return <Pin className="h-5 w-5 text-purple-400 rotate-45" />;
      case "heart":
        return <Heart className="h-5 w-5 text-pink-400 fill-pink-500/20" />;
      case "flame":
        return <Flame className="h-5 w-5 text-amber-400 fill-amber-500/20" />;
      case "sparkles":
      default:
        return <Sparkles className="h-5 w-5 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-48 bg-purple-900/30 rounded-lg animate-pulse" />
          <div className="h-6 w-20 bg-purple-900/20 rounded-md animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0 rounded-xl bg-purple-950/20 border border-purple-900/20 p-2 animate-pulse"
            >
              <div className="aspect-[2/3] w-full rounded-lg bg-purple-900/30" />
              <div className="mt-2.5 h-4 w-3/4 bg-purple-900/40 rounded" />
              <div className="mt-1.5 h-3 w-1/2 bg-purple-900/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (novels.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-12">
      {/* Header bar with purple container box like Last Update */}
      <div className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between shadow-lg shadow-purple-950/40 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-black/20 text-white shadow-sm">
            {renderIcon()}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-purple-100/80 font-medium hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrow navigation buttons */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white transition-all hover:bg-black/40 active:scale-95"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white transition-all hover:bg-black/40 active:scale-95"
              aria-label="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Link
            to={targetUrl}
            className="inline-flex items-center gap-1 rounded-lg bg-black/25 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-black/45"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
        >
          {novels.map((novel) => {
            const latestCh = novel?.lastChapters?.[0];
            const chNumber = latestCh?.number || latestCh?.title?.match(/\d+/)?.[0] || null;

            return (
              <div
                key={novel.id}
                onClick={() => {
                  if (dragDistanceRef.current > 10) return;
                  navigate(`/novel/${novel.slug}`);
                }}
                className="group relative w-[135px] sm:w-[165px] md:w-[185px] lg:w-[200px] shrink-0 cursor-pointer overflow-hidden rounded-xl bg-[#130c24]/80 border border-purple-900/30 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.3)] flex flex-col"
              >
                {/* Cover with 2:3 aspect ratio */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-purple-950/50">
                  <LazyImage
                    src={getImageUrl(novel.cover)}
                    alt={novel.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    wrapperClassName="h-full w-full"
                  />
                  {/* Subtle gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#130c24] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {novel.is_pinned || novel.is_project ? (
                      <span className="rounded-md bg-purple-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
                        PINNED
                      </span>
                    ) : novel.hot ? (
                      <span className="rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
                        HOT
                      </span>
                    ) : (
                      <span />
                    )}

                    <RatingBadge rating={novel.rating} />
                  </div>

                  {/* Bottom Chapter Badge on Cover */}
                  {chNumber && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="inline-block rounded-md bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 text-[11px] font-bold text-purple-200 backdrop-blur-md shadow-sm">
                        Ch. {chNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-[#130c24]/90">
                  <h3
                    className="text-xs sm:text-sm font-semibold text-gray-200 line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors"
                    title={novel.title}
                  >
                    {novel.title}
                  </h3>

                  <div className="mt-2 pt-1.5 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-purple-300/70">
                    <span className="capitalize truncate max-w-[80px]">
                      {novel.status || "Ongoing"}
                    </span>
                    <span className="text-purple-400 font-medium">Baca &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NovelCoverSlider;
