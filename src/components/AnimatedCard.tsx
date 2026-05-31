import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type AnimatedCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  shine?: boolean;
};

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  shine = false,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "card-motion",
        visible ? "card-motion-visible" : "",
        shine ? "card-motion-shine" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--card-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
