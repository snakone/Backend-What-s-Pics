import { Request, Response } from 'express';
import { User, USER } from '../models/user.model';
import bcrypt from 'bcrypt';
import Token from '../class/token';

const USER_CTRL: any = {};

// GET
USER_CTRL.getUsers = async (req: Request, res: Response) => {

  await User.find({}, {}, (err, users) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error loading Users',
        err
      });
    }

    res.status(200).json({
      ok: true,
      message: 'Users',
      users
    });
  });
}

USER_CTRL.getUserByToken = async (req: Request, res: Response) => {

  const user = req.user;

  res.status(200).json({
    ok: true,
    message: 'User by Token',
    user
  });
}

USER_CTRL.getUserById = async (req: Request, res: Response) => {

  const id = req.params.id;

  await User.findById(id, (err, user) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error loading User by Id',
        err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User with Id " + id + " doesn't exist",
      });
    }

    res.status(200).json({
      ok: true,
      message: 'User by Id',
      user
    });
  });
}

USER_CTRL.refreshToken = async (req: Request, res: Response) => {

  const user: USER = req.body;

  const token = Token.createToken(user);

  res.status(200).json({
    ok: true,
    message: 'Refresh Token',
    token,
    user
  });

}

// CREATE
USER_CTRL.createUser = async (req: Request, res: Response) => {

  const body: USER = req.body;

  if (body.password == undefined) {
      return res.status(400).json({
        ok: false,
        message: 'User needs Password',
      });
  }

  body.password = bcrypt.hashSync(body.password, 10);
  const user = new User(body);

  await user.save((err, user) => {
    if (err) {
      return res.status(409).json({
        ok: false,
        message: 'Error creating User. Email must be unique',
        err
      });
    }
    user.password = '';
    const token = Token.createToken(user);

    res.status(201).json({
      ok: true,
      message: 'User created',
      user,
      token
    });
  });
}

// UPDATE
USER_CTRL.updateUser = async (req: Request, res: Response) => {

  const body: USER = req.body;
  const id = req.user._id;

  if (body.name == '' || body.email == '') {
    return res.status(400).json({
      ok: false,
      message: "User needs Name, Email",
    });
  }

  const data = {
    name: body.name,
    email: body.email,
    avatar: body.avatar || req.user.avatar
  }

  User.findByIdAndUpdate(id, data, { new: true }, (err, user) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error updating User',
        err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User with Id " + id + " doesn't exist",
      });
    }

    user.password = '';
    const token = Token.createToken(user);

    res.status(201).json({
      ok: true,
      message: 'User updated',
      user,
      token
    });
  });
}

// REMOVE
USER_CTRL.deleteUser = async (req: Request, res: Response) => {

  const user = req.user;

  User.findOneAndRemove({ _id: user._id }, (err, user) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error Deleting User',
        err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User with Id " + user._id + " doesn't exist",
      });
    }
  });

  res.status(200).json({
    ok: true,
    message: 'Deleted User',
    user
  });
}

export default USER_CTRL;