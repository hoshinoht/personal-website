import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { education, certifications } from '../data/portfolio';
import styles from '../styles/components/Education.module.css';

export function Education() {
  return (
    <section id="education" className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        Education
      </motion.h2>

      <div className={styles.timeline}>
        {education.map((edu, i) => (
          <motion.div
            key={edu.institution}
            className={styles.timelineItem}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className={styles.timelineDot} />
            <div className={styles.eduCard}>
              <h3 className={styles.institution}>{edu.institution}</h3>
              <p className={styles.degree}>{edu.degree}</p>
              <p className={styles.field}>{edu.field}</p>
              <p className={styles.period}>{edu.period}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <h3 className={styles.subheading}>Certifications</h3>
      <div className={styles.certGrid}>
        {certifications.map((cert, i) => (
          <motion.div
            key={cert.name}
            className={styles.certCard}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className={styles.certIcon}>
              <Award size={20} />
            </div>
            <div>
              <p className={styles.certName}>{cert.name}</p>
              <p className={styles.certIssuer}>{cert.issuer}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
