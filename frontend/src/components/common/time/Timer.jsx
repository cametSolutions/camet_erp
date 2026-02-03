import { useEffect,useState } from "react"

export const Timer = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <>
      <span className="text-xs font-medium text-gray-300 group-hover:text-gray-100">
        {currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })}
      </span>
    </>
  )
}
