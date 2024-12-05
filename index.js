const express = require("express");
const app = express();
require("./db/config");
const cors = require('cors');
const Admin = require("./db/Admin");
const Product = require("./db/Product");
const Categorie = require("./db/Categorie");
const Sponsor = require("./db/Sponsor");
const Order = require("./db/Order");
const PORT = process.env.PORT || 7000;
app.use(express.json());
app.use(cors({
    origin: '*'
  }));
app.post("/login", async (req, res) => {
    if (req.body.username && req.body.password) {
        try {
            let user = await Admin.findOne(req.body).select("username _id");
            if (user) {
                res.json(user); // Respond with the user object as JSON
            } else {
                res.status(404).json({ message: "No result found" }); // Respond with JSON and a 404 status code
            }
        } catch (error) {
            res.status(500).json({ error: "Internal server error" }); // Handle any potential errors
        }
    } else {
        res.status(400).json({ message: "Username and password are required" }); // Handle missing credentials
    }
});
function validateInput({ name, email, mobile, username }) {
    const errors = {};

    // Name validation: should not be empty and should contain only letters and spaces
    if (!name || !/^[a-zA-Z\s]+$/.test(name)) {
        errors.name = "Name must contain only letters and spaces, and cannot be empty.";
    }

    // Email validation: using a basic email regex pattern
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format.";
    }

    // Mobile validation: must be exactly 10 digits
    if (!mobile || !/^\d{10}$/.test(mobile)) {
        errors.mobile = "Mobile number must be exactly 10 digits.";
    }

    // Username validation: should not be empty and should contain only letters, numbers, underscores, and dots
    if (!username || !/^[a-zA-Z0-9._]+$/.test(username)) {
        errors.username = "Username can contain letters, numbers, underscores, and dots, and cannot be empty.";
    }

    return errors;
}
app.post("/register", async (req, res) => {
    if (req.body.name && req.body.email && req.body.username && req.body.mobile) {
        try {
            const { email, mobile, username } = req.body;
            let user = await Admin.findOne({
                $or: [
                    { username: username },
                    { email: email },
                    { mobile: mobile }
                ]
            });
            if (user) {
                let matchedField = null;

                if (user.mobile === mobile) {
                    matchedField = 'mobile';
                } else if (user.email === email) {
                    matchedField = 'email';
                } else if (user.username === username) {
                    matchedField = 'username';
                }
                res.json({ exists: true, matchedField }); // Return which field matched
            } else {
                try {
                    const { name, email, mobile, username } = req.body;
                    const validationErrors = validateInput({ name, email, mobile, username });
                    if (Object.keys(validationErrors).length > 0) {
                        return res.json({ errors: validationErrors });
                    }
                    let users = new Admin(req.body);
                    let result = await users.save();
                    result = result.toObject();
                    delete result.name;
                    delete result.email;
                    delete result.mobile;
                    res.send(result);
                }
                catch (error) {
                    res.send(error);
                }
            }
        }
        catch (error) {
            res.json({ error: "Internal server error" }); // Handle any potential errors
        }
    }
    else {
        res.json({ message: "Please fill the all details" });
    }
})
app.post("/setpassword", async (req, res) => {
    let result = await Admin.updateOne({ username: req.body.username }, { $set: { password: req.body.password } })
    res.json(result);
})
app.post("/addproduct", async (req, res) => {
    let product = new Product(req.body);
    try {
        let result = await product.save();
        res.send({ success: true, message: "Product saved successfully" });
    } catch (error) {
        console.error("Error saving product:", error);
        res.send({ success: false, message: "Failed to save product" });
    }
})
app.get("/product", async (req, res) => {
    try{
        let result = await Product.find();
        res.send(result.reverse());
    }catch(err){
        res.send({error:err});
    }
})
app.post("/addcategorie", async (req, res) => {
    let categ = new Categorie(req.body);
    try {
        let result = await categ.save();
        res.send({ success: true, message: "Product saved successfully" });
    } catch (error) {
        res.send({ success: false, message: "Failed to save product" });
    }
})
app.post("/addsponsor", async (req, res) => {
    let sponsor = new Sponsor(req.body);
    try {
        let result = await sponsor.save();
        res.send({ success: true, message: "Sponsor saved successfully" });
    } catch (error) {
        res.send({ success: false, message: "Failed to save sponsor" });
    }
})
app.get("/getsponsor", async (req, res) => {
    try {
        let result = await Sponsor.find();
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/getcategories", async (req, res) => {
    try {
        let result = await Categorie.find();
        res.send(result);
    } catch (e) {
        res.send({ message: e });
    }
})
app.post("/updatecategoryname", async (req, res) => {
    try {
        let update = await Categorie.updateOne({ _id: req.body.id }, { $set: { categorie: req.body.categorie } });
        res.send(update);
    } catch (err) {
        res.send({ error: err })
    }

})
app.put("/updatecategorieimage", async (req, res) => {
    try {
        let update = await Categorie.updateOne({ _id: req.body.id }, { $set: { src: req.body.src } });
        res.send(update);
    } catch (err) {
        res.send({ error: err });
    }
})
app.delete("/deletecategorie/:id", async (req, res) => {
    try {
        let deleteC = await Categorie.deleteOne({ _id: req.params.id });
        res.send(deleteC);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/updatebrand/:id", async (req, res) => {
    if (req.body) {
        try {
            let result = await Sponsor.updateOne({ _id: req.params.id }, { $set: req.body });
            res.send(result);
        } catch (err) {
            res.send({ error: err });
        }
    }
})
app.delete("/deletebrand/:id", async (req, res) => {
    try {
        let result = await Sponsor.deleteOne({ _id: req.params.id });
        res.send(result);
    }
    catch (err) {
        res.send({ error: err });
    }
})
app.get('/getadmins', async (req, res) => {
    try {
        let result = await Admin.find().select("-password");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/offersproduct", async (req, res) => {
    try {
        let result = await Product.find({ todaysOffer: true });
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err })
    }
})
app.get("/noneoffersproduct", async (req, res) => {
    try {
        let result = await Product.find({ todaysOffer: false });
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err })
    }
})
app.get("/bestproduct", async (req, res) => {
    try {
        let result = await Product.find({ bestSelling: true });
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err })
    }
})
app.get("/nonebestproduct", async (req, res) => {
    try {
        let result = await Product.find({ bestSelling: false });
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err })
    }
})
app.put("/removebest/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { bestSelling: false } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/addbest/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { bestSelling: true } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/removeoffer/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { todaysOffer: false } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/removelaunch/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { launched: false } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/removepublish/:id", async (req,res) => {
    try{
        console.log("working")
        let result = await Product.updateOne({_id:req.params.id},{publish:"private"});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.put("/addpublish/:id", async (req,res) => {
    try{
        let result = await Product.updateOne({_id:req.params.id},{publish:"public"});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.put("/addoffer/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { todaysOffer: true } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/addlaunch/:id", async (req, res) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, { $set: { launched: true } });
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/launched", async (req, res) => {
    try {
        let result = await Product.find({launched:true},{publish:"public"}).select("_id name brand categorie description images").sort({ _id: -1 }).limit(3);
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/getbest", async (req, res) => {
    try {
        let result = await Product.find({ bestSelling: true ,publish: 'public'}).select("_id brand categorie description name description images discountedPrice");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/category", async (req, res) => {
    try {
        let result = await Categorie.find().select("_id categorie src").limit(3);
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/getoffersuser", async (req, res) => {
    try {
        let result = await Product.find({ todaysOffer: true, publish: "public" }).select("_id name images brand description categorie price discount discountedPrice").limit(14);
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/filter", async (req, res) => {
    try {
        let result = await Product.find({ publish: "public", categorie: req.query.categorie }).select("_id name images brand description categorie price discount discountedPrice");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/sponsoruser", async (req, res) => {
    try {
        let result = await Sponsor.find().select("-date");
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/moreproducts", async (req, res) => {
    try {
        let result = await Product.find({ publish: "public" }).select("-tags -publish -date -todaysOffer -bestSelling -stockQuantity");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/launchesuser", async (req, res) => {
    try {
        let result = await Product.find({ launched: true, publish: "public" }).select("-tags -publish -date -todaysOffer -bestSelling -stockQuantity");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/categorylist", async (req, res) => {
    try {
        let result = await Categorie.find().select("_id categorie src");
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/offerproducts", async (req, res) => {
    try {
        let result = await Product.find({ todaysOffer: true, publish: "public" }).select("_id name images brand price description categorie discount discountedPrice");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/getproductdata/:id", async (req, res) => {
    try {
        let result = await Product.find({ _id: req.params.id }).select("-tags -publish -date -todaysOffer -bestSelling -stockQuantity");
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/relatedproducts", async (req, res) => {
    try {
        let result = await Product.find({
            publish: "public",
            $or: [
                { categorie: req.query.categorie },
                { brand: req.query.brand }
            ]
        }).select("-tags -publish -date -todaysOffer -bestSelling -stockQuantity");
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/search", async (req, res) => {
    const stopWords = ['for', 'and', 'the', 'in', 'on', 'at', 'a', 'an', 'is'];
    let Query = req.query.searched;
    let tokens = await Query.split(' ');
    const filteredTokens = tokens.filter(token => !stopWords.includes(token.toLowerCase()));
    
    try {
        const products = await Product.find({
            $and: filteredTokens.map(keyword => ({publish:"public",
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { modelNumber: { $regex: keyword, $options: 'i' } },
                    { brand: { $regex: keyword, $options: 'i' } },
                    { categorie: { $regex: keyword, $options: 'i' } },
                    { tags: { $elemMatch: { tag: { $regex: keyword, $options: 'i' } } } },
                    { specifications: { $elemMatch: { speciality: { $regex: keyword, $options: 'i' } } } },
                    { specifications: { $elemMatch: { value: { $regex: keyword, $options: 'i' } } } }
                ]
            }))
        })
        res.send(products.reverse());
    } catch (err) {
        res.json({ error: err.message });
    }
});
app.post("/order", async (req, res) => {
    let order = new Order(req.body);
    try {
        let result = await order.save();
        result = result._id;
        res.send(result);
    } catch (err) {
        res.send({ message: err });
    }
})
app.get("/neworders", async (req, res) => {
    try {
        let result = await Order.find({ seenByAdmin: false });
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/orderlist", async (req, res) => {
    try {
        let result = await Order.find();
        res.send(result.reverse());
    } catch (err) {
        res.send({ error: err });
    }
})
app.put("/orderseen/:id", async (req, res) => {
    try {
        let result = await Order.updateOne({ _id: req.params.id }, { $set: { seenByAdmin: true } });
        res.send(result);
    } catch (err) {
        res.send({ message: err });
    }
})
app.get("/orderimages/:id", async (req, res) => {
    try {
        let result = await Product.find({ _id: req.params.id }).select("images modelNumber");
        res.send(result);
    } catch (err) {
        res.send({ error: err });
    }
})
app.get("/gettotalorders", async (req, res) => {
    try {
        let result = await Order.find({ $or: [{ orderStatus: "Pending" }, { orderStatus: "Deliverd" }] }).select("_id");
        result = result.length;
        let todayOrders = await Order.find({
            date: {
                $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setUTCHours(23, 59, 59, 999)),
            },
        });
        todayOrders = todayOrders.length;
        let monthOrders = await Order.find({
            date: {
                $gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)),
                $lt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)),
            },
        });
        monthOrders = monthOrders.length;
        const currentYear = new Date().getUTCFullYear();
        const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(currentYear + 1, 0, 1, 0, 0, 0, 0));
        let yearOrders = await Order.find({
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        yearOrders = yearOrders.length;
        res.send({ totalorders: result, todayorders: todayOrders, monthorders: monthOrders ,yearorders:yearOrders});
    } catch (err) {
        res.send({ message: err });
    }
})
app.get("/gettotalamount", async (req, res) => {
    let Total = today = month = year = 0;
    try {
        let result = await Order.find({ $or: [{ orderStatus: "Pending" }, { orderStatus: "Deliverd" }] }).select("amount");
        result.map((item) => {
            return Total = Total + item.amount
        });
        let todayOrders = await Order.find({ date: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)), $lt: new Date(new Date().setUTCHours(23, 59, 59, 999)), }, });
        todayOrders.map((item) => {
            return today = today + item.amount
        });
        let monthOrders = await Order.find({ date: { $gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)), $lt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)), }, });
        monthOrders.map((item) => {
            return month = month + item.amount
        });
        const currentYear = new Date().getUTCFullYear();
        const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(currentYear + 1, 0, 1, 0, 0, 0, 0));
        let yearOrders = await Order.find({
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        yearOrders.map((item) => {
            return year = year + item.amount
        });
        res.send({ totalamount: Total, todayamount: today, monthamount: month , yearamount: year});
    } catch (err) {
        res.send({ message: err });
    }
})
app.get("/orderdetails/:id",async (req,res)=>{
    try{
        let result = await Order.find({_id:req.params.id});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.get("/orderproduct/:id", async (req,res)=>{
    try{
        let result = await Product.find({_id:req.params.id}).select("images brand description price discountedPrice discount stockQuantity availabilityStatus modelNumber");
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.delete("/deleteorder/:id", async (req,res)=>{
    try{
        let result = await Order.deleteOne({_id:req.params.id});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.get("/adminproductview/:id", async (req,res)=>{
    try{
        let result = await Product.find({_id:req.params.id});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.get("/sellquantity/:id", async (req,res)=>{
    try{
        let result = await Order.find({productId:req.params.id,$or:[{orderStatus:"Pending"},{orderStatus:"Deliverd"}]});
        result = result.length;
        res.send({quantity:result});
    }catch(err){
        res.send({error:err});
    }
})
app.put("/updateorder/:id", async (req,res)=>{
    try{
        let result = await Order.updateOne({_id:req.params.id},{$set:req.body});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.put("/editproduct/:id",async (req,res)=>{
    try{
        result = await Product.updateOne({_id:req.params.id},{$set:req.body});
        res.send(result);
    }catch(err){
        res.send({error:err});
    }
})
app.get("/userdetail/:id",async (req,res)=>{
    try{
        let result = await Admin.findOne({_id:req.params.id}).select("-password");
        res.send(result);
    }catch(err){
        res.send({error:err})
    }
})
app.put("/userupdate/:id",async (req,res)=>{
    console.log(req.params.id)
    try{
        let result = await Admin.updateOne({_id:req.params.id},{$set:req.body});
        res.send({result});
    }catch(err){
        res.send({error:err});
    }
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});