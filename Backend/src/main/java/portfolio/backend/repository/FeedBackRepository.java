package portfolio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.backend.entity.Feedback;

public interface FeedBackRepository extends JpaRepository<Feedback, Long> {
}
