type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen = ({
  message = "Warming up the claw…",
}: LoadingScreenProps) => (
  <div className="grid h-full min-h-40 place-items-center">
    <p className="flex flex-col items-center gap-3 font-extrabold text-olive-900">
      <span aria-hidden className="text-4xl motion-safe:animate-bounce">
        💛
      </span>
      {message}
    </p>
  </div>
);
