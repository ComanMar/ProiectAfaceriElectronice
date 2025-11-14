// client/src/pages/Homepage.jsx
import React from 'react'

export default function HomePage() {
  return (
    <div
      className="h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url(/ae_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl text-center bg-white bg-opacity-70 p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover the best products at competitive prices
        </p>
        <a
          href="/products"
          className="inline-block text-white font-bold py-3 px-8 rounded-lg transition duration-200"
          style={{ backgroundColor: "#6366f1" }}
        >
          View Products
        </a>
      </div>
    </div>

  )
}

