import { parseDocumentBlocks } from "@/lib/itms/kb"
import { cn } from "@/lib/utils"

export function DocumentBody({
  body,
  className,
  variant = "default",
}: {
  body: string
  className?: string
  variant?: "default" | "formal"
}) {
  const blocks = parseDocumentBlocks(body || "")
  const formal = variant === "formal"

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No content available.</p>
    )
  }

  return (
    <div
      className={cn(
        formal
          ? "space-y-5 text-[15px] leading-7 text-foreground/90"
          : "space-y-4 text-[15px] leading-7 text-foreground",
        className
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          return (
            <h2
              key={index}
              id={block.id}
              className={cn(
                "scroll-mt-24 font-semibold tracking-tight",
                formal
                  ? "border-b border-foreground/15 pb-2 text-xl"
                  : "border-b pb-2 text-xl"
              )}
            >
              {block.text}
            </h2>
          )
        }
        if (block.type === "h2") {
          return (
            <h3
              key={index}
              id={block.id}
              className={cn(
                "scroll-mt-24 pt-2 font-semibold tracking-tight",
                formal ? "text-[1.05rem] text-foreground" : "text-lg"
              )}
            >
              {block.text}
            </h3>
          )
        }
        if (block.type === "h3") {
          return (
            <h4
              key={index}
              id={block.id}
              className="scroll-mt-24 text-base font-semibold text-foreground/90"
            >
              {block.text}
            </h4>
          )
        }
        if (block.type === "li") {
          return (
            <div key={index} className="flex gap-3 pl-1">
              <span
                className={cn(
                  "mt-[0.7rem] size-1.5 shrink-0 rounded-full",
                  formal ? "bg-foreground/55" : "bg-foreground/70"
                )}
              />
              <p className="text-justify">{block.text}</p>
            </div>
          )
        }
        if (block.type === "ol") {
          let n = 1
          for (let i = index - 1; i >= 0; i--) {
            if (blocks[i].type === "ol") n += 1
            else break
          }
          return (
            <div key={index} className="flex gap-3 pl-1">
              <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                {n}.
              </span>
              <p className="text-justify">{block.text}</p>
            </div>
          )
        }
        return (
          <p key={index} className="text-justify">
            {block.text}
          </p>
        )
      })}
    </div>
  )
}
