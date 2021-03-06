const Card = require('../models/card');

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Вы не заполнили обязательные поля или данные не верны');
      }
    })
    .catch(next);
};

const deleteCardById = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new NotFound('Карточка с таким id не найдена!');
    })
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.id)
          // eslint-disable-next-line no-shadow
          .then((card) => {
            res.send(card);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              throw new BadRequest('Неправильный id');
            }
          })
          .catch(next);
      } else {
        throw new Forbidden('Недостаточно прав для удаления карточки');
      }
      return res.status(200).send({ message: 'Карточка удалена' });
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new NotFound('Карточка с таким id не найдена!');
    })
    // eslint-disable-next-line no-unused-vars
    .then((card) => {
      Card.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { likes: req.user } },
        { new: true },
      )
        // eslint-disable-next-line no-shadow
        .then((card) => res.send(card))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new BadRequest('Ошибка валидации данных');
          }
        })
        .catch(next);
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new NotFound('Карточка с таким id не найдена!');
    })
    // eslint-disable-next-line no-unused-vars
    .then((card) => {
      Card.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.user._id } },
        { new: true },
      )
        // eslint-disable-next-line no-shadow
        .then((card) => res.send(card))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new BadRequest('Неправильный id');
          }
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
