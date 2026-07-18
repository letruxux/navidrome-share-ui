import { useEffect, useMemo, useState } from "react";
import useQueryParams from "react-use-query-params";
import type { ShareInfo } from "../../index";

const Loader = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-loader-circle-icon lucide-loader-circle animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-dvh flex-col">{children}</div>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}

function ShareInfo({ shareInfo }: { shareInfo: ShareInfo | null }) {
  if (!shareInfo) return null;
  const firstTrack = shareInfo.tracks[0];
  if (!firstTrack) return null;
  return (
    <Centered>
      <img
        className="rounded-full bg-black size-64"
        src={`${new URL(shareInfo.shareUrl).origin}/share/img/${firstTrack.id}?size=300&square=true`}
        alt={firstTrack.album}
      />
      <h1 className="text-xl font-bold mt-4">{firstTrack.album}</h1>
      <h1 className="text-mauve-400 mt-2">
        {firstTrack.artist} ⸱ {shareInfo.tracks.length} shared track
        {shareInfo.tracks.length > 1 && "s"}
      </h1>
      <hr className="border-mauve-400 max-w-lg w-full my-4" />
      <div className="flex flex-col gap-4 max-w-lg w-full">
        {shareInfo.tracks.map((track) => (
          <div
            key={track.id}
            className="flex gap-4 max-w-lg w-full hover:bg-[rgba(0,0,0,0.8)] transition-colors p-2 rounded-xl"
          >
            <div className="w-full">
              <h2 className="text-lg font-bold">{track.title}</h2>
              <h3 className="text-mauve-400">{track.artist}</h3>
            </div>
            <div className="w-full flex items-center justify-end">
              <div className="text-mauve-400">{formatSeconds(track.duration)}</div>
            </div>
          </div>
        ))}
      </div>
    </Centered>
  );
}

function Loading() {
  return (
    <Centered>
      <Loader />
    </Centered>
  );
}

function Error({ error }: { error: Error }) {
  return (
    <Centered>
      <div className="text-red-500">Error: {error.message}</div>
    </Centered>
  );
}

export default function App() {
  const [params] = useQueryParams();
  const url = useMemo(() => params.url.at(0) || null, [params]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetch(`/api/extract?url=${url}`)
      .then((r) => r.json())
      .then((r) => {
        setShareInfo(r.shareInfo);
        console.log(r);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, [url]);

  return (
    <div
      className="
      min-h-dvh
      w-full
      text-white
      bg-black
      bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_40%)]
    "
    >
      {loading && <Loading />}
      {error && <Error error={error} />}
      {!loading && !error && <ShareInfo shareInfo={shareInfo} />}
    </div>
  );
}
