import React from "react";

function ChatList({ user, bot }) {
  return (
    <div>
      <div className="chatbot-request">
        <span>{user}</span>
      </div>
      <div className="chatbot-response">
        <span> {bot}</span>
      </div>
    </div>
  );
}

export default ChatList;
