// import React, { useRef, useState, useEffect } from 'react';
// import './App.css';

// function App() {
//   const wsRef = useRef(null);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [printers, setPrinters] = useState([]);
//   const [defaultPrinter, setDefaultPrinter] = useState('');
//   const [logs, setLogs] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);

//   // WebSocket configuration
//   const WS_URL = 'ws://localhost:9978';
//   const TOKEN = 'supersecret'; // Same token as in Electron app

//   const addLog = (message, type = 'info') => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs(prev => [...prev, { message, type, timestamp }]);
//     console.log(`[${type.toUpperCase()}] ${message}`);
//   };

//   const connectWebSocket = () => {
//     // Close existing connection if any
//     if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
//       wsRef.current.close();
//     }

//     setConnectionStatus('connecting');
//     addLog('Connecting to print server...', 'info');

//     try {
//       wsRef.current = new WebSocket(`${WS_URL}?token=${TOKEN}`);

//       wsRef.current.onopen = () => {
//         setConnectionStatus('connected');
//         setIsConnected(true);
//         addLog('✅ Connected to AaravPOS Print Server', 'success');
        
//         // Get health status on connect
//         getHealthStatus();
//       };

//       wsRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           handleWebSocketMessage(data);
//         } catch (error) {
//           addLog('❌ Error parsing message from server', 'error');
//         }
//       };

//       wsRef.current.onclose = () => {
//         setConnectionStatus('disconnected');
//         setIsConnected(false);
//         addLog('🔌 Disconnected from print server', 'warning');
//       };

//       wsRef.current.onerror = (error) => {
//         setConnectionStatus('error');
//         setIsConnected(false);
//         addLog('❌ Cannot connect to print server. Make sure Electron app is running.', 'error');
//       };

//     } catch (error) {
//       setConnectionStatus('error');
//       addLog('❌ Failed to create WebSocket connection', 'error');
//     }
//   };

//   const handleWebSocketMessage = (data) => {
//     const { type, payload, requestId } = data;

//     switch (type) {
//       case 'connected':
//         addLog(`🔄 ${payload.message}`, 'success');
//         break;

//       case 'health_response':
//         if (payload.ok) {
//           setPrinters(payload.printers || []);
//           setDefaultPrinter(payload.defaultPrinter || '');
//           addLog(`✅ Health check: ${payload.totalPrinters} printers found`, 'success');
//         } else {
//           addLog('❌ Health check failed', 'error');
//         }
//         break;

//       case 'print_response':
//         if (payload.success) {
//           addLog(`✅ Receipt printed successfully on ${payload.printer}`, 'success');
//         } else {
//           addLog(`❌ Print failed: ${payload.message}`, 'error');
//         }
//         break;

//       case 'cash_drawer_response':
//         if (payload.success) {
//           addLog(`💰 Cash drawer opened on ${payload.printer}`, 'success');
//         } else {
//           addLog(`❌ Cash drawer failed: ${payload.message}`, 'error');
//         }
//         break;

//       case 'test_print_response':
//         if (payload.success) {
//           addLog(`🧪 Test print successful on ${payload.printer}`, 'success');
//         } else {
//           addLog(`❌ Test print failed: ${payload.message}`, 'error');
//         }
//         break;

//       case 'error':
//         addLog(`❌ Error: ${payload.message}`, 'error');
//         break;

//       default:
//         addLog(`📨 Unknown message type: ${type}`, 'warning');
//     }
//   };

//   const sendRequest = (type, payload = {}) => {
//     if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
//       addLog('❌ Not connected to print server', 'error');
//       return;
//     }

//     const requestId = Date.now();
//     wsRef.current.send(JSON.stringify({ type, payload, requestId }));
//   };

//   // API Methods
//   const getHealthStatus = () => {
//     sendRequest('health');
//   };

//   const testPrint = () => {
//     addLog('🧪 Sending test print request...', 'info');
//     sendRequest('test_print');
//   };

//   const openCashDrawer = () => {
//     addLog('💰 Opening cash drawer...', 'info');
//     sendRequest('open_cash_drawer');
//   };

//   const printSampleReceipt = () => {
//     const sampleReceipt = {
//       order: {
//         id: "order-" + Date.now(),
//         status: "PAID",
//         currency: "USD",
//         subtotalCents: 3650,
//         discountCents: 500,
//         taxCents: 280,
//         tipCents: 500,
//         totalCents: 3930
//       },
//       orderItems: [
//         {
//           id: "item-1",
//           itemType: "PRODUCT",
//           itemId: "prod-123",
//           name: "Wireless Mouse",
//           qty: 1,
//           unitPriceCents: 2500,
//           lineTotalCents: 2500
//         },
//         {
//           id: "item-2",
//           itemType: "SERVICE",
//           itemId: "serv-456",
//           name: "Technical Support",
//           qty: 1,
//           unitPriceCents: 1500,
//           lineTotalCents: 1500
//         },
//         {
//           id: "item-3",
//           itemType: "PRODUCT",
//           itemId: "prod-789",
//           name: "USB Cable",
//           qty: 2,
//           unitPriceCents: 350,
//           lineTotalCents: 700
//         }
//       ],
//       payments: [
//         {
//           paymentId: "pay-" + Date.now(),
//           provider: "STRIPE",
//           methodCode: "CARD",
//           status: "SUCCEEDED",
//           amountCents: 3930,
//           currency: "USD",
//           receiptInvoiceNumber: "RCPT-" + Date.now()
//         }
//       ],
//       methodBreakdown: [
//         {
//           methodCode: "CARD",
//           amountCents: 3930
//         }
//       ],
//       totals: {
//         paidCents: 3930,
//         refundedCents: 0,
//         dueCents: 0
//       },
//       finalInvoice: {
//         id: "inv-" + Date.now(),
//         invoiceNumber: "INV/" + new Date().getFullYear() + "/" + Date.now(),
//         series: "RETAIL",
//         barcode: "BC" + Date.now(),
//         barcodeType: "CODE128",
//         issuedAt: new Date().toISOString(),
//         metadataType: "FINAL"
//       }
//     };

//     addLog('🖨️ Sending sample receipt for printing...', 'info');
//     sendRequest('print_receipt', sampleReceipt);
//   };

//   // Auto-connect on component mount
//   useEffect(() => {
//     connectWebSocket();

//     // Cleanup on unmount
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, []);

//   const getStatusColor = () => {
//     switch (connectionStatus) {
//       case 'connected': return '#4CAF50';
//       case 'connecting': return '#FF9800';
//       case 'error': return '#F44336';
//       default: return '#9E9E9E';
//     }
//   };

//   const getStatusText = () => {
//     switch (connectionStatus) {
//       case 'connected': return 'Connected';
//       case 'connecting': return 'Connecting...';
//       case 'error': return 'Connection Error';
//       default: return 'Disconnected';
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>🖨️ AaravPOS Print Client</h1>
//         <div className="connection-status">
//           <div 
//             className="status-indicator"
//             style={{ backgroundColor: getStatusColor() }}
//           ></div>
//           <span>Status: {getStatusText()}</span>
//           <button 
//             className="reconnect-btn"
//             onClick={connectWebSocket}
//             disabled={connectionStatus === 'connecting'}
//           >
//             🔄 Reconnect
//           </button>
//         </div>
//       </header>

//       <main className="App-main">
//         {/* Printer Info */}
//         <div className="info-section">
//           <h2>Printer Information</h2>
//           {defaultPrinter ? (
//             <div className="printer-info">
//               <p><strong>Default Printer:</strong> {defaultPrinter}</p>
//               <p><strong>Available Printers:</strong> {printers.length}</p>
//               <ul className="printer-list">
//                 {printers.map((printer, index) => (
//                   <li key={index} className={printer.isDefault ? 'default-printer' : ''}>
//                     {printer.name} {printer.isDefault && '(Default)'}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ) : (
//             <p>No printer information available. Connect to see printers.</p>
//           )}
//         </div>

//         {/* Control Buttons */}
//         <div className="control-section">
//           <h2>Print Controls</h2>
//           <div className="button-grid">
//             <button 
//               className="control-btn health-btn"
//               onClick={getHealthStatus}
//               disabled={!isConnected}
//             >
//               🔍 Health Check
//             </button>
            
//             <button 
//               className="control-btn test-btn"
//               onClick={testPrint}
//               disabled={!isConnected}
//             >
//               🧪 Test Print
//             </button>
            
//             <button 
//               className="control-btn cash-btn"
//               onClick={openCashDrawer}
//               disabled={!isConnected}
//             >
//               💰 Open Cash Drawer
//             </button>
            
//             <button 
//               className="control-btn print-btn"
//               onClick={printSampleReceipt}
//               disabled={!isConnected}
//             >
//               🖨️ Print Sample Receipt
//             </button>
//           </div>
//         </div>

//         {/* Logs */}
//         <div className="logs-section">
//           <h2>Activity Log</h2>
//           <div className="logs-container">
//             {logs.slice().reverse().map((log, index) => (
//               <div key={index} className={`log-entry log-${log.type}`}>
//                 <span className="log-time">[{log.timestamp}]</span>
//                 <span className="log-message">{log.message}</span>
//               </div>
//             ))}
//             {logs.length === 0 && (
//               <div className="log-entry log-info">
//                 No activity yet. Connect to the print server to see logs.
//               </div>
//             )}
//           </div>
//           <button 
//             className="clear-logs-btn"
//             onClick={() => setLogs([])}
//           >
//             🗑️ Clear Logs
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;

import React, { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const wsRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [printers, setPrinters] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const WS_URL = "ws://localhost:9978";
  const TOKEN = "supersecret";

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    setConnectionStatus("connecting");
    addLog("Connecting to print server...", "info");

    try {
      wsRef.current = new WebSocket(`${WS_URL}?token=${TOKEN}`);

      wsRef.current.onopen = () => {
        setConnectionStatus("connected");
        setIsConnected(true);
        addLog("✅ Connected to AaravPOS Print Server", "success");
        getHealthStatus();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch {
          addLog("❌ Error parsing message from server", "error");
        }
      };

      wsRef.current.onclose = () => {
        setConnectionStatus("disconnected");
        setIsConnected(false);
        addLog("🔌 Disconnected from print server", "warning");
      };

      wsRef.current.onerror = () => {
        setConnectionStatus("error");
        setIsConnected(false);
        addLog("❌ Cannot connect to print server. Make sure Electron app is running.", "error");
      };
    } catch {
      setConnectionStatus("error");
      addLog("❌ Failed to create WebSocket connection", "error");
    }
  };

  const handleWebSocketMessage = (data) => {
    const { type, payload } = data;
    switch (type) {
      case "health_response":
        if (payload.ok) {
          setPrinters(payload.printers || []);
          setDefaultPrinter(payload.defaultPrinter || "");
          addLog(`✅ ${payload.totalPrinters} printers detected`, "success");
        } else addLog("❌ Health check failed", "error");
        break;
      default:
        addLog(`📨 Unknown message type: ${type}`, "warning");
    }
  };

  const sendRequest = (type, payload = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog("❌ Not connected to print server", "error");
      return;
    }
    const requestId = Date.now();
    wsRef.current.send(JSON.stringify({ type, payload, requestId }));
  };

  const getHealthStatus = () => sendRequest("health");
  const testPrint = () => sendRequest("test_print");
  const openCashDrawer = () => sendRequest("open_cash_drawer");
  const printSampleReceipt = () => sendRequest("print_receipt", { demo: true });

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "#22c55e";
      case "connecting": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🖨️ AaravPOS Print Client</h1>
        <div className="status">
          <span className="dot" style={{ backgroundColor: getStatusColor() }}></span>
          <span className="status-text">{connectionStatus}</span>
          <button onClick={connectWebSocket} disabled={connectionStatus === "connecting"}>
            🔄 Reconnect
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* LEFT SIDE */}
        <div className="left-panel">
          <section className="panel">
            <h2>Printer Information</h2>
            {defaultPrinter ? (
              <>
                <p><strong>Default Printer:</strong> {defaultPrinter}</p>
                <ul>
                  {printers.map((p, i) => (
                    <li key={i} className={p.isDefault ? "highlight" : ""}>
                      {p.name} {p.isDefault && "(Default)"}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No printer detected yet.</p>
            )}
          </section>

          <section className="panel">
            <h2>Controls</h2>
            <div className="btns">
              <button onClick={getHealthStatus} disabled={!isConnected}>🔍 Health Check</button>
              <button onClick={testPrint} disabled={!isConnected}>🧪 Test Print</button>
              <button onClick={openCashDrawer} disabled={!isConnected}>💰 Open Drawer</button>
              <button onClick={printSampleReceipt} disabled={!isConnected}>🖨️ Print Sample</button>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-panel">
          <section className="panel logs-panel">
            <h2>Activity Log</h2>
            <div className="logs">
              {logs.length ? (
                logs.slice().reverse().map((log, i) => (
                  <div key={i} className={`log ${log.type}`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              ) : (
                <p className="no-log">No activity yet...</p>
              )}
            </div>
            <button className="clear" onClick={() => setLogs([])}>🗑️ Clear Logs</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
