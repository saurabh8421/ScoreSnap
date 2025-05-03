import React from 'react'

function Header() {
  return (
    <div>
      {/* Header */}
      <header className="text-center mt-10">
        <h1 className="text-5xl font-bold font-orbitron text-brandBlue hover:text-brandGreen transition-colors duration-300">
          ScoreSnap
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Instant Answer Key Analyzer</p>
      </header>
    </div>
  )
}

export default Header
