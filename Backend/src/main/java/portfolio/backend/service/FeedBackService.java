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

    public Boolean saveFeedBack(String feedback, String session) {
        Feedback save = feedBackRepository.save(Feedback.builder()
                        .session(session)
                        .feedback(feedback)
                        .build());

        return !save.getFeedback().isEmpty();
    }
}
