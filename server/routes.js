/* eslint-disable */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');

const User = require('./models/user.js');
const Profile = require('./models/profile.js');
const Link = require('./models/link.js');
const Project = require('./models/project.js');

const secret = 'shakeweight';

// TODO: Refactor routes into seperate files.

router.get('/me', (req,res) => {
  if (req.body.jwt) {
    const headers = jwt.decode(req.body.jwt, secret);
    res.set(headers);
    res.send(headers);
  }
  else {
    res.send('not logged in');
  }
});

router.get('/logout', (req,res) => {
  res.set({ 'User_id': undefined, 'jwt': undefined })
  res.send('true');
});

router.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if (username && password && email) {
    User.findByUsername(username, email)
      .then(user => {
        if (user.length) {
          res.status(409);
          res.send('User already exists.');
        }

        if (!user.length) {
          bcrypt.hash(password, 10, (err, hash) => {
            User.createNewUser(username, hash, email)
              .then(data => {
                const payload = { user_id: data[0].uid };
                const token = jwt.encode(payload, secret);

                Profile.init(data[0].uid, username);

                res.status(201);
                res.set({ 'Username': data[0].username, 'Jwt': token });
                res.send({ 'Username': data[0].username, 'Jwt': token });
              });
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  } else {
    res.send('Please fill out all forms.');
  }
});

router.post('/login', (req, res) => {
  const password = req.body.password;
  let username = null;
  let email = null;

  if (req.body.username) {
    username = req.body.username;
  }

  if (req.body.email) {
    email = req.body.email;
  }

  User.findByUsername(username, email)
    .then(user => {
      if (!user.length) {
        res.status(401);
        res.send('User does not exist.');
      }

      if (user.length) {
        console.log(user);
        bcrypt.compare(password, user[0].password, (err, match) => {
          if (match) {
            const payload = { username: user[0].username };
            const token = jwt.encode(payload, secret);
            res.status(201);
            res.set({ 'Username': user[0].username, 'Jwt': token });
            res.send({ Username: user[0].username, Jwt: token });
          }

          if (!match) {
            res.status(401);
            res.send('Incorrect password');
          }
        });
      }
    });
});

router.post('/profile', (req, res) => {
  if (req.headers.jwt) {
    // TODO: Refactor this authentication into a seperate file.
    const dLoad = jwt.decode(req.headers.jwt, secret);
    const profileData = {
      user_id: dLoad.user_id,
      bio: req.body.bio,
      profile_pic: req.body.profile_pic,
      profession: req.body.profession,
      name: req.body.name,
      socialLinks: req.body.socialLinks
    };
    let links = profileData.socialLinks;

    Profile.updateProfile(profileData)
      .then(profiles => {
        if (links.length) {
          links.forEach(link => {
            link.profile_id = profiles[0].id;
            if (!link.id) {
              Link.addLink(link);
            } else {
              Link.updateLink(link);
            }
          });
        }
      });

    res.status(201);
    res.send(profileData);
  } else {
    res.send('No authentication detected');
  }

});

router.post('/project', (req, res) => {
  if (req.headers.jwt) {
    const user_id = jwt.decode(req.headers.jwt, secret).user_id;
    const projectData = {
      id: req.body.id,
      profile_id: null,
      title: req.body.title,
      description: req.body.description,
      github_link: req.body.github_link,
      website_link: req.body.website_link,
      images: req.body.images,
      stack: req.body.stack
    };


    Profile.findAllByUserId(user_id)
      .then(profile => {
        projectData.profile_id = profile[0].id;
        projectData.images = projectData.images.join(',');
        projectData.stack = projectData.stack.join(',');

        if (projectData.id && projectData.profile_id){
          Project.findByProfileId(projectData.id, projectData.profile_id)
            .then(projects => {
              if (!projects[0].length) {
                Project.updateProject(projectData)
                .then(project => {
                  res.send(project[0]);
                })
              } else {
                res.send('Project does not exist.');
              }
            });
        } else {
          projectData.order = 0;
          Project.createProject(projectData)
            .then(project => {
              res.send(project[project.length-1]);
            });
        }
      })
      .catch(err => {
        res.send(err);
      });
  } else {
    res.send('No authentication detected');
  }
});

router.get('/user/:id', (req, res) => {
  const user = req.params.id;

  Profile.findByUsername(user)
    .then(profile => {
      // Shape data to match example data.
      delete profile.password;
      delete profile.email;
      delete profile.uid;
      profile.projects = [];

      Link.findByProfileId(profile.id)
        .then(links => {
          profile.socialLinks = links;
          res.send(profile)
        })
    })
    .catch(err => {
      res.status(404);
      res.send(404);
    });
});

module.exports = router;
