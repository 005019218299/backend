const express = require('express'); //npm install express
const app = express();
const mongoose = require('mongoose'); //npm install mongoose
app.use(express.json());
const cors = require('cors');
// app.use(cors()); //npm install cors
require('dotenv').config();
const bcrypt = require('bcryptjs'); //npm install bcryptjs

const jwt = require('jsonwebtoken'); //npm install jsonwebtoken
const JWT_SECRET = "nvanvlasoqq09ffhoecnanckadjvdvadvadffeqefvdb425345yu6iujhgfbfvd";

app.use(cors({
    origin: 'http://localhost:3001',  // Cho phép yêu cầu từ localhost:3001
    methods: ['GET', 'POST'],  // Phương thức cho phép
    allowedHeaders: ['Content-Type', 'Authorization'],  // Các header cho phép
  }));

const mongoUrl = "mongodb+srv://abcgohan123mam:s3Psqg97pphdJUJz@cluster0.cmq7j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUrl, {
    useNewUrlParser: true
})
    .then(() => {
        console.log("Connected to database");
    })
    .catch(e => console.log(e));


require('./userDetails');

const User = mongoose.model("UserInfo");




const path = require('path');


// Cấu hình Express phục vụ các file tĩnh từ thư mục build di chuyển
app.use(express.static(path.join(__dirname, "public_html", "my-app", "build")));

// Route cho tất cả các URL khác để render index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public_html", "my-app", "build", "index.html"));
});



app.use(express.json());

// Hàm tạo mã ngẫu nhiên 5 ký tự
const generateCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
};
app.post('/CheckCode', async (req, res) => {
    const { email, inputcode } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Người Dùng Không Tồn Tại " });
        }

        if (user.currentCode === inputcode) {
            const newCode = generateCode();
            user.balance += 10000;
            user.currentCode = newCode;
            await user.save();
            return res.json({ status: "success", newCode, NewBalance: user.balance, message: "Mã xác thực đúng" });
         
        } else {
            return res.json({ status: "error", message: "Mã xác thực không đúng" });
        }



    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: "Lỗi hệ thống" });
    }

});








app.post('/register', async (req, res) => {
    const { username, password, email, confirmPassword, sdtNumber } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);  //Mã Hóa mật khẩu
    const encryptedConfirmPassword = await bcrypt.hash(confirmPassword, 10);  //Mã Hóa mật khẩu

    try {
        await User.create({
            username,
            password: encryptedPassword,
            email,
            balance: 0,
            currentCode: generateCode(),
            confirmPassword: encryptedConfirmPassword,
            sdtNumber,
        });
        res.send({ status: "ok" });
    } catch (error) {
        console.log(error);
        res.send({ status: "error" });
    }
});

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//         return res.json({ error: "User not found" });
//     }
//     if (await bcrypt.compare(password, user.password)) {
//         const token = jwt.sign({ email: user.email, username: user.username }, JWT_SECRET);


//         if (res.status(201)) {
//             return res.json({ status: "ok", data: token });
//         } else {
//             return res.json({ error: "error" });
//         }
//     }
//     return res.json({ status: "error", error: "Invalid Password" });

// });


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        // Tạo token
        const token = jwt.sign(
            { email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: "1h" } // Thêm thời gian hết hạn cho token
        );

        // Kiểm tra token có tồn tại không
        if (!token) {
            return res.status(500).json({ error: "Token generation failed" });
        }

        return res.status(200).json({ status: "ok", data: token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/userData", async (req, res) => {
    const { token } = req.body;
    console.log(token);

    try {
        const user = jwt.verify(token, JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired đéo có";
            }
            return res;
        });
        console.log(user);
        if (user == "token expired") {
            return res.send({ status: "error", data: "token expired" });
        }

        const useremail = user.email;
        User.findOne({ email: useremail })
            .then((data) => {
                res.send({ status: "ok", data: data });
                console.log(data.balance);

            })
            .catch((error) => {
                res.send({ status: "error", data: error });
            });
    } catch (error) { }
});




// app.post("/updateBlance", async (req, res) => {
//     const { token, balance } = req.body;
//     try {
//         const user = await User.findOneAndUpdate(
//             { token: token },
//             { $set: { balance: balance } },
//             { new: true }
//         );
//         res.json({ status: "ok", data: user });
//         console.log(user);
//     } catch (error) {
//         res.json({ status: "error", data: error });
//     }

// });



app.listen(5000, () => {
    console.log("Server started ");
});






