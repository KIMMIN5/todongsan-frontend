import { useCallback, useEffect, useState } from "react";

type UseInViewOptions = {
  /** 한 번 보이면 계속 true로 유지합니다. 기본값 true. */
  once?: boolean;
  /** IntersectionObserver의 rootMargin. 미리 로드하려면 양수 마진을 줍니다. */
  rootMargin?: string;
  /** 교차 임계값. 기본값 0. */
  threshold?: number | number[];
};

/**
 * 엘리먼트가 viewport에 들어왔는지를 IntersectionObserver로 감지합니다.
 * 무거운 컴포넌트를 "화면에 보일 때만" 마운트할 때 사용합니다.
 *
 * callback ref + element state 기반이라, 대상 노드가 첫 렌더 이후
 * (예: 로딩 완료 후) 늦게 마운트되어도 observer가 정상 등록됩니다.
 *
 * IntersectionObserver를 지원하지 않는 환경에서는 즉시 true로 폴백합니다.
 */
export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = "200px",
  threshold = 0,
}: UseInViewOptions = {}) {
  const [element, setElement] = useState<T | null>(null);
  // IntersectionObserver 미지원 환경에서는 처음부터 보이는 것으로 폴백합니다.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  // callback ref: 노드가 마운트/언마운트될 때 element state를 갱신합니다.
  // 이렇게 해야 ref가 늦게 붙어도 아래 effect가 다시 실행됩니다.
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (!element) return;
    if (once && inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, inView, once, rootMargin, threshold]);

  return { ref, inView };
}
