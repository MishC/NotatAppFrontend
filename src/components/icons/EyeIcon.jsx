export default function EyeIcon({
  isOpen = false,
  onClick = () => {},
  className = "w-[21px] h-[21px]  cursor-pointer",
}) {
  return (
    <div onClick={onClick} className="flex items-center">
      {isOpen ? (
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="10.5" cy="10.3" r="3.5" fill="currentColor"></circle>
          <path
            d="M10.5 15.55C7.28 15.55 3.95 13.87 1.29 10.3 
               C3.95 6.73 7.28 5.05 10.5 5.05
               C13.72 5.05 17.05 6.73 19.71 10.3
               C17.05 13.87 13.72 15.55 10.5 15.55Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="10.5" cy="10.3" r="3.5" fill="currentColor"></circle>
          <path
            d="M10.5 15.55C7.28 15.55 3.95 13.87 1.29 10.3 
               C3.95 6.73 7.28 5.05 10.5 5.05
               C13.72 5.05 17.05 6.73 19.71 10.3
               C17.05 13.87 13.72 15.55 10.5 15.55Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="2"
            y1="18.5"
            x2="19"
            y2="2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
