import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from './components/Header'
import Footer from './components/Footer';


function App() {
  const [scrapedData, setScrapedData] = useState({});
  const [allSectionStats, setAllSectionStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');
  const reportRef = useRef();

  const fetchScrapedData = async () => {
    if (!url) return alert("Please enter a URL to scrape");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:500/scrape?url=${encodeURIComponent(url)}`);
      const result = await res.json();
      result.success
        ? (setScrapedData(result.data), setAllSectionStats(result.allSectionStats))
        : setError('Failed to load data');
    } catch {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const totals = Object.values(allSectionStats).reduce(
    (acc, sec) => {
      acc.right += sec["Right Answer"] || 0;
      acc.wrong += sec["Wrong Answer"] || 0;
      acc.ignored += sec["Ignored"] || 0;
      return acc;
    },
    { right: 0, wrong: 0, ignored: 0 }
  );

  const downloadPDF = async () => {
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const { width } = pdf.internal.pageSize;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, width, height);
    pdf.save('report.pdf');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Header/>

      {/* Main Content */}
      <main className="flex-grow py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* URL Input */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-6">
            <input
              type="text"
              placeholder="Enter test URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={fetchScrapedData}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition font-semibold"
            >
              Fetch
            </button>
          </div>

          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            📄 Candidate Report
          </h2>

          {loading && (
            <p className="text-center text-gray-600 animate-pulse">Fetching data...</p>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && Object.keys(scrapedData).length > 0 ? (
            <div ref={reportRef} className='p-8'>
              {/* Personal Info Card */}
              <div className="bg-white shadow-lg rounded-xl mb-10 overflow-hidden border">
                <div className="px-6 py-4 border-b bg-blue-100">
                  <h3 className="text-xl font-semibold text-gray-800">👤 Personal / Test Info</h3>
                </div>
                <ul className="divide-y text-sm">
                  {Object.entries(scrapedData)
                    .filter(([k]) => !k.toLowerCase().includes('photograph'))
                    .map(([key, val]) => (
                      <li key={key} className="px-6 py-3 flex justify-between">
                        <span className="font-medium text-gray-600">{key}</span>
                        <span className="text-gray-800">{val}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Section Stats Card */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
                <div className="px-6 py-4 border-b bg-indigo-100">
                  <h3 className="text-xl font-semibold text-gray-800">📈 Section-wise Performance</h3>
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      {['Section', 'Right', 'Wrong', 'Ignored', 'Marks'].map(col => (
                        <th key={col} className="px-4 py-3 text-left">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(allSectionStats).map(([section, stats]) => {
                      const marks = (stats["Right Answer"] - stats["Wrong Answer"] / 3).toFixed(2);
                      return (
                        <tr key={section} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{section}</td>
                          <td className="px-4 py-2">{stats["Right Answer"]}</td>
                          <td className="px-4 py-2">{stats["Wrong Answer"]}</td>
                          <td className="px-4 py-2">{stats["Ignored"]}</td>
                          <td className="px-4 py-2 font-medium">{marks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3">{totals.right}</td>
                      <td className="px-4 py-3">{totals.wrong}</td>
                      <td className="px-4 py-3">{totals.ignored}</td>
                      <td className="px-4 py-3">
                        {(totals.right - totals.wrong / 3).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            !loading && !error && (
              <div className="text-center text-gray-400 mt-20">
                
                <h3 className="text-lg font-medium">Welcome to <span className="text-brandBlue font-bold">ScoreSnap</span></h3>
                <p className="text-sm mt-1">Paste a test report URL above and click <strong>Fetch</strong> to get started.</p>
              </div>
            )
          )}

          {/* Action Buttons */}
          {Object.keys(scrapedData).length > 0 && (
            <div className="flex justify-center gap-6 mt-10">
              <button
                onClick={fetchScrapedData}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              >
                🔄 Refresh
              </button>
              <button
                onClick={downloadPDF}
                className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
              >
                📥 Download PDF
              </button>
            </div>
          )}
        </div>
          <Footer/>
      </main>
    </div>
  );
}

export default App;
