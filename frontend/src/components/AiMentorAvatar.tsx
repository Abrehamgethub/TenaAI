// Professional AI Mentor Avatar - Gender-neutral, friendly, modern design
const AiMentorAvatar = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="100%" stopColor="#C4956A" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx="50" cy="50" r="48" fill="url(#avatarGradient)" />
      
      {/* Face */}
      <ellipse cx="50" cy="52" rx="22" ry="24" fill="url(#skinTone)" />
      
      {/* Hair - Modern short style */}
      <path
        d="M28 42C28 28 36 18 50 18C64 18 72 28 72 42C72 46 70 48 68 48C68 44 64 30 50 30C36 30 32 44 32 48C30 48 28 46 28 42Z"
        fill="#2D3748"
      />
      
      {/* Left eyebrow */}
      <path
        d="M36 44C38 42 42 42 44 44"
        stroke="#4A5568"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Right eyebrow */}
      <path
        d="M56 44C58 42 62 42 64 44"
        stroke="#4A5568"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Left eye */}
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#2D3748" />
      <circle cx="41" cy="49" r="1" fill="white" />
      
      {/* Right eye */}
      <ellipse cx="60" cy="50" rx="4" ry="3" fill="#2D3748" />
      <circle cx="61" cy="49" r="1" fill="white" />
      
      {/* Nose */}
      <path
        d="M50 52L48 58L50 59L52 58L50 52"
        fill="#B8956A"
        opacity="0.5"
      />
      
      {/* Warm smile */}
      <path
        d="M42 64C44 68 56 68 58 64"
        stroke="#8B5C5C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Professional collar/shirt hint */}
      <path
        d="M35 80C35 74 42 70 50 70C58 70 65 74 65 80"
        fill="#E2E8F0"
      />
      <path
        d="M45 70L50 76L55 70"
        fill="#CBD5E1"
      />
      
      {/* AI sparkle indicator */}
      <circle cx="76" cy="24" r="6" fill="#FCD34D" />
      <path
        d="M76 20L77 23L80 24L77 25L76 28L75 25L72 24L75 23L76 20Z"
        fill="white"
      />
    </svg>
  );
};

export default AiMentorAvatar;
