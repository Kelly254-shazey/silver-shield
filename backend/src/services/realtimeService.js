let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function emitToAdmins(event, payload) {
  if (!ioInstance) {
    return;
  }
  ioInstance.to("admin").emit(event, payload);
}

function emitDonationUpdate(donationId, payload) {
  if (!ioInstance) {
    return;
  }
  ioInstance.to(`donation:${donationId}`).emit("donation:update", payload);
  ioInstance.to("admin").emit("donation:update", payload);
}

module.exports = {
  setIO,
  emitToAdmins,
  emitDonationUpdate,
};
