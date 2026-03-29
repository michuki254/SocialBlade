/**
 * Seed list of top YouTube channels globally.
 * These are well-known channels that should always be tracked
 * regardless of whether they appear in trending feeds.
 *
 * Channel IDs are stable and never change even if the channel renames.
 * This list is supplemented by auto-discovery from trending videos.
 */
export const SEED_CHANNELS: Array<{ channelId: string; label: string }> = [
  // === Top 20 Most Subscribed (All Time) ===
  { channelId: 'UCq-Fj5jknLsUf-MWSy4_brA', label: 'T-Series' },
  { channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA', label: 'MrBeast' },
  { channelId: 'UCbCmjCuTUZos6Inko4u57UQ', label: 'Cocomelon - Nursery Rhymes' },
  { channelId: 'UCpEhnqL0y41EpW2TvWAHD7Q', label: 'SET India' },
  { channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', label: 'PewDiePie' },
  { channelId: 'UCk8GzjMOrta8yxDcKfylJYw', label: 'Kids Diana Show' },
  { channelId: 'UCJplp5SWAQSiCJwsOg_Hg6Q', label: 'Like Nastya' },
  { channelId: 'UCJ5v_MCY6GNUBTO8-D3XoAg', label: 'WWE' },
  { channelId: 'UCVHFbqXqoYvEWM1Ddxl0QDg', label: 'Zee Music Company' },
  { channelId: 'UC295-Dw_tDNtZXFeAPAQNOQ', label: 'Vlad and Niki' },
  { channelId: 'UCFFbwnve3yF62-tVXkTyHqg', label: 'Stokes Twins' },
  { channelId: 'UCRzzo-fcYMiMN2hEfpMFbwQ', label: 'Dude Perfect' },
  { channelId: 'UCvjgXvBlCQOFhyAXhFMV96w', label: 'Goldmines' },
  { channelId: 'UCBnZ16ahKA2DZ_T5W0FPUXg', label: 'CKay' },
  { channelId: 'UCWOA1ZGiwLbDQJk5kMvNnuA', label: 'FLAVOR' },

  // === Indian Entertainment & Music ===
  { channelId: 'UCk1SpWNzOs4MYmr0uICEntg', label: 'Tips Official' },
  { channelId: 'UC56gTxNs4f9xZ7Pa2i5xNzg', label: 'Coca-Cola' },
  { channelId: 'UCOhHO2ICt0ti9KAh-QHvttQ', label: 'Sony Music India' },
  { channelId: 'UCRm96I5kmb_iGFInE5RTLGA', label: 'Saregama Music' },
  { channelId: 'UCqwUrj10mAEsqezcItqvwEw', label: 'Colors TV' },
  { channelId: 'UC6pSrQMO2bIAkNlcnFrLFKQ', label: 'Zee TV' },
  { channelId: 'UCjIy-bEFbrMlMKfBMiDBvjA', label: 'ChuChu TV Nursery Rhymes' },
  { channelId: 'UCiYcA0gJzg855iSKMrX3oHg', label: 'Aaj Tak' },

  // === Latin America ===
  { channelId: 'UCEuOwB9vSL1oPKGNdONB4ig', label: 'Kondzilla' },
  { channelId: 'UCYiGq8XF7YQD00x7wAd62Zg', label: 'GR6 EXPLODE' },
  { channelId: 'UCs2epJlM5GfGnIkWg4ytcew', label: 'Badabun' },
  { channelId: 'UCq-Fj5jknLsUf-MWSy4_brA', label: 'Canal KondZilla' },
  { channelId: 'UCVPYbobPRzz0SjinWekjUBw', label: 'Luccas Neto' },
  { channelId: 'UCcdwLMPsaU2ezNSJU1nFoBQ', label: 'El Reino Infantil' },

  // === Music Artists (Global) ===
  { channelId: 'UCIwFjwMjI0y7PDBVEO9-bkQ', label: 'Justin Bieber' },
  { channelId: 'UCcgqSGOC8ZaCSyEXDml5hMg', label: 'Ed Sheeran' },
  { channelId: 'UCZFWPqqPkFlNwIxcpsLOwew', label: 'Marshmello' },
  { channelId: 'UCYd1eLoAx1-LPKFmgKVwG8A', label: 'BTS - BANGTANTV' },
  { channelId: 'UCoUM-UJ7rirJYP8CQ0EIaHA', label: 'BLACKPINK' },
  { channelId: 'UCnxQ8o9RicMcaFUOiC7QBYQ', label: 'Taylor Swift' },
  { channelId: 'UCuHzBCaKmwYKDB5FgIQMDnQ', label: 'Ariana Grande' },
  { channelId: 'UCIjYyZxkFucP_W-tmXg_ILw', label: 'Shakira' },
  { channelId: 'UCy3zgWom-5AGypGX_FVTKpg', label: 'Daddy Yankee' },
  { channelId: 'UCN1hnUccO4FD5WfM7ithXaw', label: 'Eminem' },
  { channelId: 'UCedvOgsKFzcK3hA5tBzOeEQ', label: 'Billie Eilish' },
  { channelId: 'UCByOQJjav0CUDwxCk-jVNRQ', label: 'KAROL G' },
  { channelId: 'UCLkAepWjdylmXSltofFvsYQ', label: 'BLACKPINK' },
  { channelId: 'UC0WP5P-ufpRLnAd8OtPW5MQ', label: 'Bad Bunny' },
  { channelId: 'UCIeSPMBFcSGuKBfPznoW6IQ', label: 'Drake' },

  // === Music Labels & VEVO ===
  { channelId: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ', label: 'Music' },
  { channelId: 'UCF0pVplsI8R5kcAqgtoRqoA', label: 'Filtr' },
  { channelId: 'UCIG9rDtgR45VCZmYnd-4DUw', label: 'Speed Records' },

  // === Gaming ===
  { channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA', label: 'MrBeast' },
  { channelId: 'UC2wKfjlioOCLP4xQMOWNcgg', label: 'Typical Gamer' },
  { channelId: 'UCpT9kL2Eba91BB9PFbMG9PA', label: 'MrBeast Gaming' },
  { channelId: 'UCIPPMRA040LQr5QPyJEbmXA', label: 'MrBeast 2' },
  { channelId: 'UCYzPXprvl5Y-Sf0g4vX-m6g', label: 'Markiplier' },
  { channelId: 'UCam8T03EOFBsNdR0thrFHdQ', label: 'FLAVOR' },
  { channelId: 'UC0RhatS1pyxInC00YKjjBqQ', label: 'Technoblade' },
  { channelId: 'UCq4cW5PsICnXp3Bi7x2cAbQ', label: 'Jazzghost' },
  { channelId: 'UCfAPs6GWx6gSwQ0gxmFrl4g', label: 'Robin Hood Gamer' },
  { channelId: 'UCHiOFsDBGBjRPkD3UrETuhw', label: 'Aphmau' },
  { channelId: 'UCNAz5Ut1Swwg6h6ysBtWFog', label: 'SSSniperWolf' },

  // === Korean Entertainment ===
  { channelId: 'UCweOkPb1wVVH0Q0Tlj4a5Pw', label: 'HYBE LABELS' },
  { channelId: 'UCEf_Bc-KVd7onSeifS3py9g', label: 'SMTOWN' },
  { channelId: 'UCOmHUn--16B90oW2L6FRR3A', label: 'BLACKPINK' },
  { channelId: 'UC3IZKseVpdzPSBaWxBxundA', label: 'HYBE LABELS' },
  { channelId: 'UCfMJ2MchTSW2kWaT0kK94Yw', label: 'WOOLLIM Entertainment' },

  // === Japanese Content ===
  { channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA', label: 'MrBeast' },
  { channelId: 'UCibEhpu5HP45-w7Bq1ZIulw', label: 'Junya' },
  { channelId: 'UCgFwu-j5-xNJml2FtTrrB3A', label: 'ONE OK ROCK' },

  // === Middle East & Africa ===
  { channelId: 'UC2Qw1dzXDBAZPwS7zm37g8g', label: 'ArabiskaDansen' },
  { channelId: 'UCmSfdtegCMKv4G8LFFuMIhA', label: 'Mohamed Ramadan' },

  // === Southeast Asia ===
  { channelId: 'UCfnHKSsJMU8LoOFRFfVjU8A', label: 'Atta Halilintar' },
  { channelId: 'UCHqC-yWZ1kri4YzwRSt6RGQ', label: 'Ricis Official' },
  { channelId: 'UCkQO3QsgTpNTsOw6ujimT5Q', label: 'Babybus - Nursery Rhymes' },

  // === US/UK Entertainment & Education ===
  { channelId: 'UC4PooiX37Pld1T8J5SYT-SQ', label: 'Bright Side' },
  { channelId: 'UCsooa4yRKGN_zEE8iknghZA', label: '5-Minute Crafts' },
  { channelId: 'UCAuUUnT6oDeKwE6v1NGQxug', label: 'TED' },
  { channelId: 'UCq8DICunczvLuJJq414110A', label: 'A4' },
  { channelId: 'UCnUYZLuoy1rq1aVMwx4piYg', label: 'Jimmy Kimmel Live' },
  { channelId: 'UCi7GJNg51C3jgmYTUwqoUXA', label: 'The Late Late Show with James Corden' },
  { channelId: 'UCVTyTA7-g9nopHeHbeuvpRA', label: 'Mark Rober' },
  { channelId: 'UCY1kMZp36IQSyNx_9h4mpCg', label: 'Mark Rober' },
  { channelId: 'UCBcRF18a7Qf58cCRy5xuWwQ', label: 'Will Smith' },

  // === Sports ===
  { channelId: 'UCWOA1ZGiwLbDQJk5kMvNnuA', label: 'NFL' },
  { channelId: 'UCGYlRUDwSPENcOmaehoPbdg', label: 'NBA' },
  { channelId: 'UCVcioxoMzpWWkFDqGCOOE8g', label: 'ICC' },

  // === News & Media ===
  { channelId: 'UCupvZG-5ko_eiXAupbDfxWw', label: 'CNN' },
  { channelId: 'UCeY0bbntWzzVIaj2z3QigXg', label: 'NBC News' },
  { channelId: 'UCXIJgqnII2ZOINSWNOGFThA', label: 'BBC News' },

  // === Kids Content ===
  { channelId: 'UCRx3mGER1k3-XSyzsMgptWA', label: 'Pinkfong Baby Shark' },
  { channelId: 'UChGJGhZ9SOOHvBB0Y4DOO_w', label: 'Ryan\'s World' },
  { channelId: 'UCgFXm4TI8htTmLtqx2NontQ', label: 'InfobellsHindi' },
  { channelId: 'UCISjeBdOlYoB95cB3s15YgA', label: 'Little Angel' },
  { channelId: 'UC09dGkNIhFGbVTddW3yGdSw', label: 'Moonbug Kids' },

  // === Tech ===
  { channelId: 'UCBJycsmduvYEL83R_U4JriQ', label: 'MKBHD' },
  { channelId: 'UCVYamHKEnwaVlRIucJNg5Ew', label: 'Unbox Therapy' },
  { channelId: 'UCsTcErHg8oDvUnTzoqsYeNw', label: 'Linus Tech Tips' },

  // === Science & Education ===
  { channelId: 'UC6nSFpj9HTCZ5t-N3Rm3-HA', label: 'Vsauce' },
  { channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', label: 'Kurzgesagt' },
  { channelId: 'UCUHW94eEFW7hkUMVaZz4eDg', label: 'minutephysics' },
  { channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', label: 'Veritasium' },

  // === Russian Content ===
  { channelId: 'UCvlE5gTbOvjiolFlEm-c_Ow', label: 'Mashaaa' },
  { channelId: 'UCWEvkMRU_7tfEztViI3ougA', label: 'Get Movies' },

  // === Lifestyle & Vlogs ===
  { channelId: 'UC-SJ6nODDmufqBzPBwCvYvQ', label: 'Liza Koshy' },
  { channelId: 'UCMtFAi84ehTSYSE9XoHefig', label: 'The ACE Family' },
]
