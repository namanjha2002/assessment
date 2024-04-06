require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const route = require("./route/user.route");
const socketIO = require('socket.io');
const Agent = require('../../assessment/src/model/agent.model')
const app = express();
const server = require('http').Server(app); 
const io = socketIO(server); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    process.env.mongodb,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));




let agentQueueLengths = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  
  socket.on('assignUser', async (userData) => {
    try {
      
      const onlineAgents = await Agent.find({ isOnline: true });
      
      if (onlineAgents.length > 0) {
        
        let shortestQueueAgent;
        let shortestQueueLength = Infinity;

        onlineAgents.forEach(agent => {
          const queueLength = agentQueueLengths.get(agent._id) || 0;
          if (queueLength < shortestQueueLength) {
            shortestQueueAgent = agent;
            shortestQueueLength = queueLength;
          }
        });

        
        const assignedAgentId = shortestQueueAgent._id;
        const updatedQueueLength = (agentQueueLengths.get(assignedAgentId) || 0) + 1;
        agentQueueLengths.set(assignedAgentId, updatedQueueLength);

        
        io.to(shortestQueueAgent.socketId).emit('userAssigned', userData);

        console.log(`User assigned to agent ${assignedAgentId}`);
      } else {
        console.log('No online agents found.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
})


app.use("/", route);

app.use(function (req, res) {
  return res.status(400).send({ status: false, message: "Path Not Found" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("Express app running on Port " + PORT);
});
