import { io } from 'socket.io-client';

const SOCKET_URL = 'https://chat-application-aumraa.onrender.com' ;

export const socket = io(SOCKET_URL); 