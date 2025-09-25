package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.backend.entity.Feedback;
import portfolio.backend.repository.FeedBackRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class FeedBackService {
    private final FeedBackRepository feedBackRepository;
    private final EmailService emailService;

    public Feedback saveFeedBack(String feedback, String session) {
        Feedback feedbackEntity = Feedback.builder()
                .session(session)
                .feedback(feedback)
                .build();

        emailService.sendEmail(feedback);

        return feedBackRepository.save(feedbackEntity);
    }
}
