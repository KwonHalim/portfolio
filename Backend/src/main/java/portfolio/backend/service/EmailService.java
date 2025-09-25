package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import portfolio.backend.exception.ErrorStatus;
import portfolio.backend.exception.RestApiException;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String myMail;

    public void sendEmail(String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String text = "새로운 피드백이 있습니다." + content;
            message.setTo(myMail);
            message.setFrom(myMail);
            message.setSubject("새로운 피드백이 들어왔습니다.");
            message.setText(text);
            mailSender.send(message);
        }
        catch (Exception e) {
            log.info("이메일 전송에 실패했습니다 사유:"+e.getMessage());
            throw new RestApiException(ErrorStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
