require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

const PORT = 3000;


// =================================================
// MIDDLEWARE
// =================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =================================================
// SESSION
// =================================================

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "ns-worldwide-secret-2026",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge:
                1000 * 60 * 60 * 4
        }
    })
);


// =================================================
// PATHS
// =================================================

const frontendPath =
    path.join(
        __dirname,
        "..",
        "frontend"
    );

const indexPath =
    path.join(
        frontendPath,
        "index.html"
    );

const adminPath =
    path.join(
        frontendPath,
        "admin.html"
    );

const adminLoginPath =
    path.join(
        frontendPath,
        "admin-login.html"
    );


// =================================================
// OLD JSON FILE PATHS
// Used only for first-time migration
// =================================================

const enquiriesFile =
    path.join(
        __dirname,
        "enquiries.json"
    );

const productsFile =
    path.join(
        __dirname,
        "products.json"
    );


// =================================================
// MONGODB
// =================================================

const MONGODB_URI =
    process.env.MONGODB_URI;


if (!MONGODB_URI) {

    console.error(
        "ERROR: MONGODB_URI is missing in .env file."
    );

    process.exit(1);
}


// =================================================
// MONGOOSE SCHEMAS
// =================================================

const productSchema =
    new mongoose.Schema(
        {
            id: {
                type: Number,
                required: true,
                unique: true,
                index: true
            },

            name: {
                type: String,
                required: true,
                trim: true
            },

            category: {
                type: String,
                required: true,
                trim: true
            },

            description: {
                type: String,
                required: true,
                trim: true
            },

            image: {
                type: String,
                required: true,
                trim: true
            }
        },
        {
            timestamps: true
        }
    );


const enquirySchema =
    new mongoose.Schema(
        {
            id: {
                type: Number,
                required: true,
                unique: true,
                index: true
            },

            name: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                default: "",
                trim: true
            },

            message: {
                type: String,
                required: true,
                trim: true
            },

            date: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );


// =================================================
// MONGOOSE MODELS
// =================================================

const Product =
    mongoose.model(
        "Product",
        productSchema
    );

const Enquiry =
    mongoose.model(
        "Enquiry",
        enquirySchema
    );


// =================================================
// MIGRATE OLD JSON DATA
// =================================================

async function migrateJsonData() {

    try {

        // -----------------------------------------
        // PRODUCTS
        // -----------------------------------------

        const productCount =
            await Product.countDocuments();


        if (
            productCount === 0 &&
            fs.existsSync(productsFile)
        ) {

            const data =
                fs.readFileSync(
                    productsFile,
                    "utf8"
                );


            const oldProducts =
                data.trim()
                    ? JSON.parse(data)
                    : [];


            if (
                Array.isArray(oldProducts) &&
                oldProducts.length > 0
            ) {

                const validProducts =
                    oldProducts.map(
                        product => ({

                            id:
                                Number(
                                    product.id
                                ),

                            name:
                                String(
                                    product.name || ""
                                ),

                            category:
                                String(
                                    product.category || ""
                                ),

                            description:
                                String(
                                    product.description || ""
                                ),

                            image:
                                String(
                                    product.image || ""
                                )

                        })
                    );


                await Product.insertMany(
                    validProducts
                );


                console.log(
                    `Imported ${validProducts.length} products from products.json`
                );

            }

        }


        // -----------------------------------------
        // ENQUIRIES
        // -----------------------------------------

        const enquiryCount =
            await Enquiry.countDocuments();


        if (
            enquiryCount === 0 &&
            fs.existsSync(enquiriesFile)
        ) {

            const data =
                fs.readFileSync(
                    enquiriesFile,
                    "utf8"
                );


            const oldEnquiries =
                data.trim()
                    ? JSON.parse(data)
                    : [];


            if (
                Array.isArray(oldEnquiries) &&
                oldEnquiries.length > 0
            ) {

                const validEnquiries =
                    oldEnquiries.map(
                        enquiry => ({

                            id:
                                Number(
                                    enquiry.id
                                ),

                            name:
                                String(
                                    enquiry.name || ""
                                ),

                            phone:
                                String(
                                    enquiry.phone || ""
                                ),

                            email:
                                String(
                                    enquiry.email || ""
                                ),

                            message:
                                String(
                                    enquiry.message || ""
                                ),

                            date:
                                String(
                                    enquiry.date ||
                                    new Date().toLocaleString("en-IN")
                                )

                        })
                    );


                await Enquiry.insertMany(
                    validEnquiries
                );


                console.log(
                    `Imported ${validEnquiries.length} enquiries from enquiries.json`
                );

            }

        }


    } catch (error) {

        console.error(
            "JSON MIGRATION ERROR:",
            error
        );

    }

}


// =================================================
// FRONTEND
// =================================================


// -------------------------------------------------
// HOME
// -------------------------------------------------

app.get(
    "/",
    (req, res) => {

        if (!fs.existsSync(indexPath)) {

            return res
                .status(500)
                .send(
                    "index.html not found."
                );

        }


        res.sendFile(
            indexPath
        );

    }
);


// -------------------------------------------------
// ADMIN LOGIN PAGE
// -------------------------------------------------

app.get(
    "/admin-login.html",
    (req, res) => {

        if (!fs.existsSync(adminLoginPath)) {

            return res
                .status(500)
                .send(
                    "admin-login.html not found."
                );

        }


        res.sendFile(
            adminLoginPath
        );

    }
);


// -------------------------------------------------
// ADMIN DASHBOARD PAGE
// -------------------------------------------------

app.get(
    "/admin.html",
    (req, res) => {

        if (!fs.existsSync(adminPath)) {

            return res
                .status(500)
                .send(
                    "admin.html not found."
                );

        }


        res.sendFile(
            adminPath
        );

    }
);


// -------------------------------------------------
// ADMIN SHORT URL
// -------------------------------------------------

app.get(
    "/admin",
    (req, res) => {

        res.redirect(
            "/admin.html"
        );

    }
);


// -------------------------------------------------
// STATIC FILES
// -------------------------------------------------

app.use(
    express.static(
        frontendPath
    )
);


// =================================================
// ADMIN AUTHENTICATION
// =================================================


// -------------------------------------------------
// LOGIN
// -------------------------------------------------

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                ).trim();


            const password =
                String(
                    req.body.password || ""
                );


            const ADMIN_USERNAME =
                process.env.ADMIN_USERNAME ||
                "admin";


            const ADMIN_PASSWORD =
                process.env.ADMIN_PASSWORD ||
                "12345";


            if (
                username === ADMIN_USERNAME &&
                password === ADMIN_PASSWORD
            ) {

                req.session.adminLoggedIn =
                    true;


                req.session.adminUsername =
                    username;


                return res.json({

                    success: true,

                    message:
                        "Login successful."

                });

            }


            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });


        } catch (error) {

            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to login."

            });

        }

    }
);


// -------------------------------------------------
// CHECK LOGIN
// -------------------------------------------------

app.get(
    "/api/admin/check",
    (req, res) => {

        if (
            req.session &&
            req.session.adminLoggedIn === true
        ) {

            return res.json({

                loggedIn: true,

                username:
                    req.session.adminUsername ||
                    "admin"

            });

        }


        return res.status(401).json({

            loggedIn: false,

            message:
                "Not authenticated."

        });

    }
);


// -------------------------------------------------
// LOGOUT
// -------------------------------------------------

app.post(
    "/api/admin/logout",
    (req, res) => {

        req.session.destroy(
            error => {

                if (error) {

                    console.error(
                        "LOGOUT ERROR:",
                        error
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to logout."

                    });

                }


                res.clearCookie(
                    "connect.sid"
                );


                return res.json({

                    success: true,

                    message:
                        "Logged out successfully."

                });

            }
        );

    }
);


// =================================================
// ADMIN PROTECTION
// =================================================

function requireAdmin(
    req,
    res,
    next
) {

    if (
        req.session &&
        req.session.adminLoggedIn === true
    ) {

        return next();

    }


    return res.status(401).json({

        success: false,

        message:
            "Admin login required."

    });

}


// =================================================
// TEST API
// =================================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "NS Worldwide backend is working!"

        });

    }
);


// =================================================
// ENQUIRIES
// =================================================


// -------------------------------------------------
// GET ENQUIRIES
// -------------------------------------------------

app.get(
    "/api/enquiries",
    requireAdmin,
    async (req, res) => {

        try {

            const enquiries =
                await Enquiry
                    .find({})
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            return res.json(
                enquiries
            );


        } catch (error) {

            console.error(
                "READ ENQUIRIES ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load enquiries."

            });

        }

    }
);


// -------------------------------------------------
// DELETE ENQUIRY
// -------------------------------------------------

app.delete(
    "/api/enquiries/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const deleted =
                await Enquiry.findOneAndDelete({
                    id: id
                });


            if (!deleted) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Enquiry not found."

                });

            }


            console.log(
                "Enquiry deleted:",
                id
            );


            return res.json({

                success: true,

                message:
                    "Enquiry deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE ENQUIRY ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete enquiry."

            });

        }

    }
);


// =================================================
// PRODUCTS
// =================================================


// -------------------------------------------------
// GET ALL PRODUCTS
// PUBLIC
// -------------------------------------------------

app.get(
    "/api/products",
    async (req, res) => {

        try {

            const products =
                await Product
                    .find({})
                    .sort({
                        createdAt: 1
                    })
                    .lean();


            return res.json(
                products
            );


        } catch (error) {

            console.error(
                "READ PRODUCTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load products."

            });

        }

    }
);


// -------------------------------------------------
// GET SINGLE PRODUCT
// PUBLIC
// -------------------------------------------------

app.get(
    "/api/products/:id",
    async (req, res) => {

        try {

            const productId =
                Number(
                    req.params.id
                );


            const product =
                await Product.findOne({
                    id: productId
                }).lean();


            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            return res.json(
                product
            );


        } catch (error) {

            console.error(
                "PRODUCT DETAILS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load product."

            });

        }

    }
);


// -------------------------------------------------
// ADD PRODUCT
// ADMIN ONLY
// -------------------------------------------------

app.post(
    "/api/products",
    requireAdmin,
    async (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            const category =
                String(
                    req.body.category || ""
                ).trim();


            const description =
                String(
                    req.body.description || ""
                ).trim();


            const image =
                String(
                    req.body.image || ""
                ).trim();


            if (
                !name ||
                !category ||
                !description ||
                !image
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, category, description and image are required."

                });

            }


            const newProduct = {

                id:
                    Date.now(),

                name:
                    name,

                category:
                    category,

                description:
                    description,

                image:
                    image

            };


            const product =
                await Product.create(
                    newProduct
                );


            console.log(
                "New product added:",
                product.name
            );


            return res.json({

                success: true,

                message:
                    "Product added successfully.",

                product:
                    product

            });


        } catch (error) {

            console.error(
                "ADD PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to add product."

            });

        }

    }
);


// -------------------------------------------------
// EDIT PRODUCT
// ADMIN ONLY
// -------------------------------------------------

app.put(
    "/api/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const productId =
                Number(
                    req.params.id
                );


            const name =
                String(
                    req.body.name || ""
                ).trim();


            const category =
                String(
                    req.body.category || ""
                ).trim();


            const description =
                String(
                    req.body.description || ""
                ).trim();


            const image =
                String(
                    req.body.image || ""
                ).trim();


            if (
                !name ||
                !category ||
                !description ||
                !image
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "All product fields are required."

                });

            }


            const product =
                await Product.findOneAndUpdate(

                    {
                        id:
                            productId
                    },

                    {
                        name:
                            name,

                        category:
                            category,

                        description:
                            description,

                        image:
                            image
                    },

                    {
                        new: true,

                        runValidators: true
                    }

                ).lean();


            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            console.log(
                "Product updated:",
                productId
            );


            return res.json({

                success: true,

                message:
                    "Product updated successfully.",

                product:
                    product

            });


        } catch (error) {

            console.error(
                "EDIT PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to edit product."

            });

        }

    }
);


// -------------------------------------------------
// DELETE PRODUCT
// ADMIN ONLY
// -------------------------------------------------

app.delete(
    "/api/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const deleted =
                await Product.findOneAndDelete({
                    id: id
                });


            if (!deleted) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            console.log(
                "Product deleted:",
                id
            );


            return res.json({

                success: true,

                message:
                    "Product deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete product."

            });

        }

    }
);


// =================================================
// CONTACT FORM
// =================================================


// -------------------------------------------------
// SAVE ENQUIRY
// -------------------------------------------------

app.post(
    "/api/contact",
    async (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            const phone =
                String(
                    req.body.phone || ""
                ).trim();


            const email =
                String(
                    req.body.email || ""
                ).trim();


            const message =
                String(
                    req.body.message || ""
                ).trim();


            if (
                !name ||
                !phone ||
                !message
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, phone and message are required."

                });

            }


            const newEnquiry = {

                id:
                    Date.now(),

                name:
                    name,

                phone:
                    phone,

                email:
                    email,

                message:
                    message,

                date:
                    new Date()
                        .toLocaleString(
                            "en-IN"
                        )

            };


            const enquiry =
                await Enquiry.create(
                    newEnquiry
                );


            console.log(
                "New enquiry received:",
                enquiry.name
            );


            return res.json({

                success: true,

                message:
                    "Your enquiry has been received."

            });


        } catch (error) {

            console.error(
                "CONTACT FORM ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to save enquiry."

            });

        }

    }
);


// =================================================
// API 404
// =================================================

app.use(
    "/api",
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "API route not found."

        });

    }
);


// =================================================
// START SERVER
// =================================================

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await mongoose.connect(
            MONGODB_URI
        );


        console.log(
            "MongoDB connected successfully."
        );


        await migrateJsonData();


        app.listen(
            PORT,
            () => {

                console.log(
                    "================================="
                );

                console.log(
                    "NS Worldwide Backend Started"
                );

                console.log(
                    "================================="
                );

                console.log(
                    `Server running at: http://localhost:${PORT}`
                );

                console.log(
                    "================================="
                );

            }
        );


    } catch (error) {

        console.error(
            "MONGODB CONNECTION ERROR:"
        );

        console.error(
            error
        );

        console.log(
            "Check MONGODB_URI inside .env"
        );

        process.exit(1);

    }

}


// =================================================
// START APPLICATION
// =================================================

startServer();