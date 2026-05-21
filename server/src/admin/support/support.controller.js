const prisma = require('../../lib/prisma');

exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: req.user.id,
        content,
        isInternal: isInternal || false
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

exports.aiSummarize = async (req, res, next) => {
  try {
    const summary = "AI Summary: The user is experiencing an issue creating a new workspace. The system throws a 500 error when they try to save. Recommend asking for browser details and checking the server logs.";
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

exports.aiSuggestReply = async (req, res, next) => {
  try {
    const reply = "Hi there, I'm sorry to hear you are having trouble creating a workspace. Could you please provide the name of the browser you are using and what specific error message you see on the screen? This will help us investigate the issue further.";
    res.status(200).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
};
