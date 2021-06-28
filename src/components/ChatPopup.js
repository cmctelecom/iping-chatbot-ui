import React, { useState } from "react";

import loading from "../assets/loading.svg";
import listeningLoad from "../assets/listening_load.svg";
import micro from "../assets/micro.png";
import audio from "../assets/audio.png";
import muteAudio from "../assets/mute_audio.png";

import ChatList from "./ChatList";
import messages from "../assets/messages.json";
import emptyImage from "../assets/emptypage.jpg";

function ChatPopup({
  requestStatus,
  handleChatSubmit,
  handleChat,
  chat,
  results,
  clickToStart,
  error,
  text,
  isMuted,
  clickToMute,
}) {
  const [isOpen, setOpen] = useState(false);
  const [isTooltip, setTooltip] = useState(false);
  const clickToPopUp = (e) => {
    setOpen(true);
  };

  const clickToClose = (e) => {
    setOpen(false);
    setTooltip(false);
  };

  const clickToAsk = (e) => {
    setTooltip(!isTooltip);
  };
  return (
    <div style={{ textAlign: "left" }}>
      <button onClick={clickToPopUp} className="listening-btn">
        <img src={micro} alt="micro" width={30} />
      </button>
      <div
        className="chat-popup"
        style={{
          display: isOpen ? "block" : "none",
        }}
      >
        <div className="chatbox-header">
          <div
            className="chatbot-tooltip"
            style={{ display: isTooltip ? "inline-block" : "none" }}
          >
            <span>- Click vào icon micro để nói.</span>
            <br />
            <span>
              - Nếu không muốn bot nói, hãy click vào loa để tắt, click 1 lần
              nữa để bật lại.
            </span>
            <br />
            <span>- Click vào tiêu đề để đóng hộp thoại.</span>
          </div>
          <span className="chatbox-title" onClick={clickToClose}>
            CMC Chatbot
          </span>
          <button className="chatbox-close" onClick={clickToAsk}>
            ?
          </button>
        </div>
        <div className="chatbox-body">
          <form onSubmit={handleChatSubmit}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                className="chatbox-input"
                disabled={
                  requestStatus === "fetching" || requestStatus === "loading"
                    ? true
                    : false
                }
                placeholder="Nhập chat"
                name="chat"
                value={chat}
                onChange={handleChat}
              />
              {requestStatus === "loading" ? (
                <img src={loading} alt="loading" width={30} />
              ) : requestStatus === "fetching" ? (
                <img src={listeningLoad} alt="listening" width={30} />
              ) : (
                <>
                  <span onClick={clickToStart}>
                    <img src={micro} alt="micro" width={30} />
                  </span>
                  <span>
                    {isMuted ? (
                      <img
                        src={muteAudio}
                        onClick={clickToMute}
                        alt="mute audio"
                        width={30}
                      />
                    ) : (
                      <img
                        src={audio}
                        onClick={clickToMute}
                        alt="audio"
                        width={30}
                      />
                    )}
                  </span>
                </>
              )}
            </div>
            <small style={{ color: "green" }}>
              {requestStatus === "loading"
                ? messages.posting[
                    Math.floor(Math.random() * messages.posting.length)
                  ]
                : null}
            </small>
            <small style={{ color: "blue" }}>
              {text
                ? messages.processing[
                    Math.floor(Math.random() * messages.processing.length)
                  ]
                : null}
            </small>
            <small style={{ color: "red" }}>{error}</small>
          </form>
          <hr />
          {results && results.length > 0 ? (
            results.map((item) => {
              return <ChatList user={item.user} bot={item.bot} />;
            })
          ) : (
            <div className="chatbot-empty">
              <img src={emptyImage} width={300} alt="empty" />
              <span>Chưa có tin nhắn nào.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPopup;
