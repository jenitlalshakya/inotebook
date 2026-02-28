import React from "react";

const About = () => {
    const features = [
        "Create notes with title, content, and tags",
        "Edit and delete notes anytime",
        "Infinite scroll for browsing large note collections",
        "Secure authentication with JWT",
        "Notes encrypted at rest on the server",
    ];

    const audience = [
        "Students organizing study notes and coursework",
        "Professionals capturing meeting notes and ideas",
        "Anyone who wants a simple, secure place for their thoughts",
    ];

    return (
        <div className="about-page auth-page">
            <div className="about-page__card">
                <h1 className="about-page__title">About iNotebook</h1>

                <section className="about-page__section">
                    <h2 className="about-page__heading">What does iNotebook do?</h2>
                    <p className="about-page__text">
                        iNotebook is a secure note-taking web application that lets you create, organize, and manage your notes with ease. Your notes are stored securely and encrypted on the server, so you can keep your ideas and information safe while accessing them from anywhere.
                    </p>
                </section>

                <section className="about-page__section">
                    <h2 className="about-page__heading">Key Features</h2>
                    <ul className="about-page__list">
                        {features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                </section>

                <section className="about-page__section">
                    <h2 className="about-page__heading">Who is it for?</h2>
                    <p className="about-page__text">
                        iNotebook is designed for a wide range of users:
                    </p>
                    <ul className="about-page__list">
                        {audience.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="about-page__section">
                    <h2 className="about-page__heading">Built with</h2>
                    <p className="about-page__text">
                        This site is built as a college project using <strong>React</strong> for the frontend and <strong>Django</strong> for the backend API, with MongoDB for storage. The tech stack provides a modern, responsive experience while keeping your data secure.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
