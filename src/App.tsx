import "./App.css";
import useCallOps from "./useCallOps";

function App() {
  const { startANewCall, joinACall, answerCall } = useCallOps();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div>
        <button id="startNewCall" onClick={startANewCall}>
          Start a call
        </button>
        <div>
          <button onClick={joinACall}>Join a call</button>
          <input id="joinACallInput" />
          <button id="answerCallButton" onClick={answerCall}>
            Answer
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "2rem",
        }}
      >
        <div
          style={{
            width: "40vw",
            height: "50vh",
            border: "1px solid red",
          }}
        >
          <h1>Local</h1>
          <div>
            <video
              id="localVideoElement"
              autoPlay
              playsInline
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
        <div
          style={{
            width: "40vw",
            height: "50vh",
            border: "1px solid blue",
          }}
        >
          <h1>Remote</h1>
          <video
            id="remoteVideoElement"
            autoPlay
            playsInline
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
