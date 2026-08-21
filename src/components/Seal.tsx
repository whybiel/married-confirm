interface SealProps {
  size?: number
  className?: string
}

export default function Seal({ size = 80, className = '' }: SealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="36" stroke="#C9A876" strokeWidth="0.75" />
      <circle cx="40" cy="40" r="30" stroke="#C9A876" strokeWidth="0.4" />
      <text
        x="40"
        y="38"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="13"
        fontWeight="500"
        fill="#C9A876"
        letterSpacing="3"
      >
        M & G
      </text>
      <text
        x="40"
        y="51"
        textAnchor="middle"
        fontFamily="Jost, sans-serif"
        fontSize="6.5"
        fontWeight="500"
        fill="#C9A876"
        letterSpacing="2.5"
      >
        10/2026
      </text>
    </svg>
  )
}
