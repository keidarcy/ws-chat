import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { Button } from './components/Button';

const URL = import.meta.env.WS_URL;

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const socket = useRef<WebSocket | null>(null);

  const [currentName, setCurrentName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [messageList, setMessageList] = useState<string[]>([]);

  const onSocketOpen = useCallback(() => {
    const name = prompt('Your name');
    if (name) {
      socket.current?.send(
        JSON.stringify({
          action: 'setName',
          name
        })
      );
      setCurrentName(name ?? '');
      setIsConnected(true);
    } else {
      alert('name can not be null');
      socket.current?.close();
    }
  }, [setMembers]);
  const onSocketClose = useCallback(() => {
    setIsConnected(false);
    setMembers(members.filter((m) => m !== currentName));
  }, []);
  const onSocketMessage = useCallback(
    (dataStr) => {
      const data = JSON.parse(dataStr);
      console.log(data);

      if (data.members) {
        setMembers(data.members);
      }
      if (data.systemMessage) {
        setMessageList((oldMessage) => [...oldMessage, data.systemMessage]);
      }
      if (data.publicMessage) {
        setMessageList((oldMessage) => [...oldMessage, data.publicMessage]);
      }
      if (data.privateMessage) {
        setMessageList((oldMessage) => [...oldMessage, 'check console']);
        console.log({ privateMessage: data.privateMessage });
      }
    },
    [messageList]
  );

  const onConnect = useCallback(() => {
    if (!URL) {
      alert('Invalid WS URL');
    } else {
      if (socket.current?.readyState !== WebSocket.OPEN) {
        socket.current = new WebSocket(URL as string);
        socket.current.addEventListener('open', onSocketOpen);
        socket.current.addEventListener('close', onSocketClose);
        socket.current.addEventListener('message', (event) => {
          onSocketMessage(event.data);
        });
      }
      console.log('connect');
    }
  }, []);

  useEffect(() => {}, []);

  const onSendPrivateMessage = useCallback((to: string) => {
    const message = prompt('Enter private message for' + to);
    socket.current?.send(
      JSON.stringify({
        action: 'sendPrivate',
        to,
        message
      })
    );
    console.log({ to, message });
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt('Enter public message');
    socket.current?.send(
      JSON.stringify({
        action: 'sendPublic',
        message
      })
    );
  }, []);

  const onDisconnect = useCallback(() => {
    socket.current?.close();
    setMembers([]);
    setMessageList([]);
    console.log('disconnect');
  }, [isConnected]);

  return (
    <div className="page">
      <div className="chat">
        <div className="chat-current">
          <p>{currentName}</p>
          <span className={`chat_status ${isConnected ? 'active' : ''}`}></span>
        </div>
        <nav className="chat-sidebar">
          {members.map((member) => (
            <p
              className="chat-sidebar_item"
              onClick={() => onSendPrivateMessage(member)}
              key={member}
            >
              {member}
            </p>
          ))}
          <span className="chat-btn red"></span>
          <span className="chat-btn yellow"></span>
          <span className="chat-btn green"></span>
        </nav>
        <div className="content">
          <div className="content-message">
            {messageList.map((message, index) => (
              <p className="content-message_item" key={`${message}-${index}`}>
                {message}
              </p>
            ))}
          </div>
          <div className="btn-group">
            {!isConnected ? (
              <Button handleClick={onConnect} content="connect" />
            ) : (
              <>
                <Button handleClick={onDisconnect} content="disconnect" /> :
                <Button handleClick={onSendPublicMessage} content="send" /> :
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
