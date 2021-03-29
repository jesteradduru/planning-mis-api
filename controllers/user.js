
const users = [
    { username: "corn", password: "password" },
    { username: "livestock", password: "password" },
    { username: "admin", password: "password" },
  ]  
  
  const handleSignIn = (req, res) => {
      
      const {username, password} = req.body;
      const user = users.filter(user => user.username === username & user.password === password );

      if (user.length !== 0){
          let u = [ { username: user[0].username } ];
          res.status(200).json(u);
      }else{
          res.status(400).json("error");
      }
  }

  module.exports = {
      handleSignIn: handleSignIn
  }