import React from 'react';

const Loding = ({ height = '100vh' }) => {
    // Configuration for the animation
    const numTails = 45; // Number of fading trailing dots
    const duration = 2.5; // Duration of one complete loop in seconds
    const baseDelay = -duration; // Negative delay so the animation starts already in motion
    const delayStep = 0.015; // Time lag between each trailing segment

    // The perfect infinity shape path
    const infinityPath = "M 150,100 C 200,30, 270,30, 270,100 C 270,170, 200,170, 150,100 C 100,30, 30,30, 30,100 C 30,170, 100,170, 150,100 Z";

    return (
        <div style={{ height }} className='flex items-center justify-center bg-transparent overflow-hidden'>
            {/* Embedded CSS for the keyframe animation */}
            <style>{`
                @keyframes drawPath {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                .trail-path {
                    fill: none;
                    stroke-linecap: round;
                    animation: drawPath ${duration}s linear infinite;
                }
            `}</style>

            <svg 
                viewBox="0 0 300 200" 
                className="w-full max-w-52 drop-shadow-2xl"
            >
                <defs>
                    {/* Gradient with cyan, purple, orange, and yellow */}
                    <linearGradient id="rainbow" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#00ffff" />    {/* Cyan */}
                        <stop offset="33%" stopColor="#a855f7" />   {/* Purple */}
                        <stop offset="66%" stopColor="#f97316" />   {/* Orange */}
                        <stop offset="100%" stopColor="#eab308" />  {/* Yellow */}
                    </linearGradient>
                </defs>

                <g>
                    {/* Render the trailing comet tail */}
                    {Array.from({ length: numTails }).map((_, i) => (
                        <path
                            key={`tail-${i}`}
                            className="trail-path"
                            d={infinityPath}
                            stroke="url(#rainbow)"
                            // Taper the size of the dots slightly as they trail further back
                            strokeWidth={16 - (i * 0.22)}
                            pathLength="100"
                            style={{
                                // A dasharray of essentially 0 with a rounded linecap makes a perfect circle/dot
                                strokeDasharray: "0.01 99.99",
                                // Linearly fade out the trailing dots
                                opacity: Math.max(0, 0.85 - (i * (0.85 / numTails))),
                                // Stagger the animation timing to create the trail
                                animationDelay: `${baseDelay + (i + 1) * delayStep}s`
                            }}
                        />
                    ))}

                    {/* Render the solid head of the line */}
                    <path
                        className="trail-path"
                        d={infinityPath}
                        stroke="url(#rainbow)"
                        strokeWidth="16"
                        pathLength="100"
                        style={{
                            // Create a solid segment covering 15% of the total path length
                            strokeDasharray: "15 85",
                            opacity: 1,
                            animationDelay: `${baseDelay}s`
                        }}
                    />
                </g>
            </svg>
        </div>
    );
}

export default Loding;