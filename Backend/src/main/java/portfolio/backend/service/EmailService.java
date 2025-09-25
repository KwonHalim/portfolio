package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String myMail;

    public void sendEmail(String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        String text = "새로운 피드백이 있습니다." + content;
        message.setTo(myMail);
        message.setSubject("새로운 피드백이 들어왔습니다.");
        message.setText(text);
        mailSender.send(message);
    }
}
