import "./Loading.css"

type LoadingProps = {
  text?: string;
  children?: React.ReactNode;
  size?: number
};

const Loading = ({ text, children, size }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center flex-col">
      <div className="showbox" style={{ transform: `scale(${size ? size * 0.1 : 0.5})` }} />
      <p className="text-lg font-bold">Loading...</p>
      <p className="text-sm text-muted-foreground mb-4">
        {text}
      </p>
      <div>
        {children}
      </div>
    </div>
  );
};

export default Loading;
