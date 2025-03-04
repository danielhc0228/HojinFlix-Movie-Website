import styled from "styled-components";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa"; // Using Lucide icons

const FooterContainer = styled.footer`
    background-color: "rgba(0, 0, 0, 1)";
    color: #fff;
    padding: 80px 0;
    text-align: center;
    position: relative;
    bottom: 0;
    width: 100%;
    margin-top: 50px;
`;

const FooterContent = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SocialIcons = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 10px;

    a {
        color: white;
        transition: color 0.3s ease-in-out;
        &:hover {
            color: #ff4500; /* Netflix-like red */
        }
    }
`;

const FooterLinks = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 10px;

    a {
        color: white;
        text-decoration: none;
        font-size: 14px;
        transition: opacity 0.3s ease-in-out;
        &:hover {
            opacity: 0.7;
        }
    }
`;

const Copyright = styled.p`
    font-size: 12px;
    opacity: 0.6;
`;

function Footer() {
    return (
        <FooterContainer>
            <FooterContent>
                <SocialIcons>
                    <a
                        href='https://facebook.com'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FaFacebook size={20} />
                    </a>
                    <a
                        href='https://twitter.com'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FaTwitter size={20} />
                    </a>
                    <a
                        href='https://instagram.com'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FaInstagram size={20} />
                    </a>
                    <a
                        href='https://youtube.com'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FaYoutube size={20} />
                    </a>
                </SocialIcons>

                <FooterLinks>
                    <a href='/'>About</a>
                    <a href='/'>Privacy</a>
                    <a href='/'>Terms</a>
                    <a href='/'>Contact</a>
                </FooterLinks>

                <Copyright>
                    © {new Date().getFullYear()} DanFlix. All Rights Not
                    Reserved.
                </Copyright>
            </FooterContent>
        </FooterContainer>
    );
}

export default Footer;
