const prisma = require('../../prisma');

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority, category } = req.body;
    
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        subject,
        description,
        priority: priority || 'medium',
        category: category || 'general'
      }
    });

    // Automatically create the first message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user.id,
        content: description
      }
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.getUserTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.getTicketDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: req.user.id },
      include: {
        messages: {
          where: { isInternal: false }, // Users can't see internal notes
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: req.user.id,
        content
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    // Mark ticket as open/waiting for support since user replied
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'open' }
      });
    } else {
       await prisma.supportTicket.update({
        where: { id },
        data: { updatedAt: new Date() }
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
